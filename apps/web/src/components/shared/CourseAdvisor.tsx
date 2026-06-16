'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Sparkles,
  RotateCcw,
  GraduationCap,
  ChevronRight,
  Send,
  BookOpen,
  DollarSign,
  Clock,
  Phone,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface Course {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  shortDescAz?: string;
  shortDescRu?: string;
  shortDescEn?: string;
  duration?: string;
  price?: number;
  level?: string;
  image?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  courses?: Course[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}Az`] as string) || '';
}

/** Parse [[course:slug]] or [[/courses/slug]] markers from AI response and return matching courses */
function parseCourseMarkers(text: string, courses: Course[]): Course[] {
  // Match both [[course:slug]] and [[/courses/slug]] formats
  const regex = /\[\[(?:course:|\/courses\/)([\w-]+)\]\]/g;
  const slugs: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    slugs.push(match[1]);
  }
  if (slugs.length === 0) return [];
  return courses.filter((c) => slugs.includes(c.slug));
}

/** Remove [[course:slug]] or [[/courses/slug]] markers from text for display */
function cleanCourseMarkers(text: string): string {
  return text.replace(/\[\[(?:course:|\/courses\/)[\w-]+\]\]/g, '').trim();
}

/** Simple markdown-ish renderer: bold, newlines, bullet lists */
function renderMessageText(text: string) {
  const cleaned = cleanCourseMarkers(text);
  const lines = cleaned.split('\n');

  return lines.map((line, i) => {
    // Bullet points
    const bulletMatch = line.match(/^[-*]\s+(.*)/);
    if (bulletMatch) {
      return (
        <div key={i} className="flex gap-1.5 ml-1">
          <span className="text-primary-500 mt-0.5 shrink-0">&#8226;</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(bulletMatch[1]) }} />
        </div>
      );
    }

    // Empty line → spacer
    if (!line.trim()) {
      return <div key={i} className="h-2" />;
    }

    // Regular line with bold
    return (
      <div key={i} dangerouslySetInnerHTML={{ __html: boldify(line) }} />
    );
  });
}

function boldify(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/** Format duration like "3 ay" → "3 месяца" / "3 months" based on locale */
function formatDuration(duration: string, locale: string): string {
  const match = duration.match(/(\d+)/);
  if (!match) return duration;
  const num = match[1];
  const words: Record<string, string> = { az: 'ay', ru: 'мес.', en: 'months' };
  return `${num} ${words[locale] || words.az}`;
}

/* ------------------------------------------------------------------ */
/* Offline fallback (no AI) — rule-based answers from our own data      */
/* ------------------------------------------------------------------ */

const FALLBACK_CONTACT = { phone: '+994 55 333 85 75', email: 'info@futureup.az' };

const FALLBACK_TEXT: Record<string, Record<string, string>> = {
  az: {
    greeting: 'Salam! 👋 FutureUp Academy-yə xoş gəldiniz. Kurslar, qiymətlər, dərs cədvəli və əlaqə barədə kömək edə bilərəm.',
    coursesIntro: '**Kurslarımız:**',
    pricesIntro: '**Kursların qiymətləri:**',
    coursesOutro: 'Hansısa kurs haqqında ətraflı bilmək üçün adını yazın.',
    priceContact: 'qiymət üçün əlaqə',
    noData: 'Kurs siyahısını indi yükləyə bilmədim. Bütün kursları saytın "Kurslar" bölməsində görə bilərsiniz.',
    schedule: '**Dərs cədvəli:**\n- Səhər qrupları: 10:00–13:00\n- Axşam qrupları: 18:00–21:00\n- Həftəsonu qrupları da var\nDəqiq vaxt üçün bizimlə əlaqə saxlayın.',
    apply: '**Qeydiyyat sadədir:**\n- Saytdakı müraciət formasını doldurun, və ya\n- Bizə zəng edin — 24 saat ərzində əlaqə saxlayacağıq.',
    certificate: 'Bəli ✅ Kursu uğurla bitirdikdə unikal QR kodlu **FutureUp Academy sertifikatı** verilir.',
    corporate: 'Bəli, şirkətlər üçün **korporativ IT təlimləri** təklif edirik. Ətraflı üçün əlaqə saxlayın.',
    teachers: 'Komandamız təcrübəli IT mütəxəssislərindən ibarətdir — saytın "Komandamız" bölməsinə baxın.',
    scholarship: 'Təqaüd və endirim imkanları barədə birbaşa bizimlə əlaqə saxlayın.',
    contactLabel: '**Əlaqə:**',
    hours: 'İş saatları: B.e–Cümə 09:00–18:00, Şənbə 10:00–15:00',
    helpHint: 'Kurslar, qiymətlər, dərs cədvəli, sertifikat və qeydiyyat barədə soruşa bilərsiniz.',
  },
  ru: {
    greeting: 'Здравствуйте! 👋 Добро пожаловать в FutureUp Academy. Помогу с вопросами о курсах, ценах, расписании и контактах.',
    coursesIntro: '**Наши курсы:**',
    pricesIntro: '**Стоимость курсов:**',
    coursesOutro: 'Чтобы узнать подробнее о курсе — напишите его название.',
    priceContact: 'цену уточняйте',
    noData: 'Не удалось загрузить список курсов сейчас. Все курсы есть в разделе «Курсы» на сайте.',
    schedule: '**Расписание занятий:**\n- Утренние группы: 10:00–13:00\n- Вечерние группы: 18:00–21:00\n- Есть группы выходного дня\nТочное время уточняйте у нас.',
    apply: '**Записаться просто:**\n- Заполните форму заявки на сайте, или\n- Позвоните нам — свяжемся в течение 24 часов.',
    certificate: 'Да ✅ После успешного окончания курса выдаётся **сертификат FutureUp Academy** с уникальным QR-кодом.',
    corporate: 'Да, мы проводим **корпоративное IT-обучение** для компаний. Свяжитесь с нами для деталей.',
    teachers: 'Наша команда — опытные IT-специалисты. Познакомьтесь с ними в разделе «Наша команда».',
    scholarship: 'По стипендиям и скидкам свяжитесь с нами напрямую.',
    contactLabel: '**Контакты:**',
    hours: 'Часы работы: Пн–Пт 09:00–18:00, Сб 10:00–15:00',
    helpHint: 'Можете спросить о курсах, ценах, расписании, сертификате и записи.',
  },
  en: {
    greeting: 'Hi! 👋 Welcome to FutureUp Academy. I can help with courses, prices, schedule and contacts.',
    coursesIntro: '**Our courses:**',
    pricesIntro: '**Course prices:**',
    coursesOutro: 'Want details on a specific course? Just type its name.',
    priceContact: 'contact for price',
    noData: "I couldn't load the course list right now. You can see all courses in the “Courses” section.",
    schedule: '**Class schedule:**\n- Morning groups: 10:00–13:00\n- Evening groups: 18:00–21:00\n- Weekend groups available\nContact us for exact times.',
    apply: '**Enrolling is easy:**\n- Fill out the application form on the website, or\n- Call us — we will get back to you within 24 hours.',
    certificate: 'Yes ✅ Upon successful completion you receive a **FutureUp Academy certificate** with a unique QR code.',
    corporate: 'Yes, we offer **corporate IT training** for companies. Contact us for details.',
    teachers: 'Our team are experienced IT professionals — meet them in the “Our Team” section.',
    scholarship: 'For scholarships and discounts, please contact us directly.',
    contactLabel: '**Contact:**',
    hours: 'Working hours: Mon–Fri 09:00–18:00, Sat 10:00–15:00',
    helpHint: 'You can ask about courses, prices, schedule, certificates and enrollment.',
  },
};

/**
 * Static course catalog used when the live /courses API can't be reached.
 * Mirrors the seeded catalog — keep roughly in sync, but live data always wins when available.
 */
type FallbackCourse = Pick<Course, 'slug' | 'titleAz' | 'titleRu' | 'titleEn' | 'duration' | 'price'>;
const STATIC_COURSES: FallbackCourse[] = [
  { slug: 'frontend-development', titleAz: 'Frontend Developer', titleRu: 'Frontend Разработчик', titleEn: 'Frontend Developer', duration: '6 ay', price: 1200 },
  { slug: 'backend-java', titleAz: 'Backend Developer (Java ilə)', titleRu: 'Backend Разработчик (Java)', titleEn: 'Backend Developer (Java)', duration: '6 ay', price: 1200 },
  { slug: 'backend-csharp', titleAz: 'Backend Developer (C# ilə)', titleRu: 'Backend Разработчик (C#)', titleEn: 'Backend Developer (C#)', duration: '6 ay', price: 1200 },
  { slug: 'mobile-development', titleAz: 'Mobile Developer', titleRu: 'Мобильный Разработчик', titleEn: 'Mobile Developer', duration: '6 ay', price: 1300 },
  { slug: 'ui-ux-design', titleAz: 'UI/UX dizayn', titleRu: 'UI/UX дизайн', titleEn: 'UI/UX Design', duration: '4 ay', price: 900 },
  { slug: 'data-analytics', titleAz: 'Data Analitik', titleRu: 'Data Аналитик', titleEn: 'Data Analytics', duration: '5 ay', price: 1000 },
  { slug: 'ai-machine-learning', titleAz: 'Süni İntellekt və ML', titleRu: 'Искусственный Интеллект и ML', titleEn: 'Artificial Intelligence & ML', duration: '6 ay', price: 1500 },
  { slug: 'data-engineering', titleAz: 'Data Engineering', titleRu: 'Data Engineering', titleEn: 'Data Engineering', duration: '6 ay', price: 1400 },
  { slug: 'quality-assurance', titleAz: 'Quality Assurance', titleRu: 'Quality Assurance', titleEn: 'Quality Assurance', duration: '5 ay', price: 900 },
  { slug: 'digital-marketing', titleAz: 'Rəqəmsal marketinq', titleRu: 'Цифровой маркетинг', titleEn: 'Digital Marketing', duration: '4 ay', price: 700 },
  { slug: 'product-owner', titleAz: 'Product Owner', titleRu: 'Product Owner', titleEn: 'Product Owner', duration: '4 ay', price: 800 },
  { slug: 'devops-engineering', titleAz: 'DevOps Mühəndisi', titleRu: 'DevOps Инженер', titleEn: 'DevOps Engineer', duration: '6 ay', price: 1400 },
  { slug: 'devsecops', titleAz: 'DevSecOps', titleRu: 'DevSecOps', titleEn: 'DevSecOps', duration: '5 ay', price: 1300 },
  { slug: 'computer-systems-networks', titleAz: 'Kompüter sistemləri və şəbəkələr', titleRu: 'Компьютерные системы и сети', titleEn: 'Computer Systems & Network Software', duration: '6 ay', price: 1100 },
  { slug: 'help-desk-specialist', titleAz: 'Help Desk mütəxəssisi', titleRu: 'Специалист Help Desk', titleEn: 'Help Desk Specialist', duration: '3 ay', price: 600 },
  { slug: 'red-team-offensive', titleAz: 'Red Team - Offensive Security', titleRu: 'Red Team - Наступательная безопасность', titleEn: 'Red Team - Offensive Security', duration: '6 ay', price: 1500 },
  { slug: 'blue-team-defensive', titleAz: 'Blue Team - Defensive Security', titleRu: 'Blue Team - Оборонительная безопасность', titleEn: 'Blue Team - Defensive Security', duration: '6 ay', price: 1400 },
  { slug: 'cyber-operations-team', titleAz: 'Cyber Operations Team', titleRu: 'Команда Кибер-операций', titleEn: 'Cyber Operations Team', duration: '6 ay', price: 1600 },
];

function fbContactBlock(locale: string): string {
  const T = FALLBACK_TEXT[locale] || FALLBACK_TEXT.az;
  return `${T.contactLabel}\n- 📞 ${FALLBACK_CONTACT.phone}\n- ✉️ ${FALLBACK_CONTACT.email}\n- 🕐 ${T.hours}`;
}

/** Build a non-AI answer from our own data based on simple keyword matching. */
function buildFallbackAnswer(question: string, courses: Course[], locale: string): string {
  const T = FALLBACK_TEXT[locale] || FALLBACK_TEXT.az;
  const raw = (question || '').trim();
  const q = raw.toLowerCase();
  const has = (...words: string[]) => words.some((w) => q.includes(w));

  const courseList = (emphasizePrice: boolean): string => {
    const data: FallbackCourse[] = courses && courses.length > 0 ? courses : STATIC_COURSES;
    if (data.length === 0) return `${T.noData}\n\n${fbContactBlock(locale)}`;
    const lines = data.slice(0, 8).map((c) => {
      const title = getLocalized(c as unknown as Record<string, unknown>, 'title', locale) || c.titleAz;
      const price = c.price ? `${c.price} AZN` : T.priceContact;
      const dur = c.duration ? formatDuration(c.duration, locale) : '';
      const meta = emphasizePrice || !dur ? price : `${price} · ${dur}`;
      return `- **${title}** — ${meta} [[course:${c.slug}]]`;
    });
    const moreMap: Record<string, string> = {
      az: 'və daha çox — saytın «Kurslar» bölməsində.',
      ru: 'и другие — в разделе «Курсы».',
      en: 'and more — see the “Courses” section.',
    };
    const more = data.length > 8 ? `\n${moreMap[locale] || moreMap.az}` : '';
    return `${emphasizePrice ? T.pricesIntro : T.coursesIntro}\n${lines.join('\n')}${more}\n\n${T.coursesOutro}`;
  };

  // Greeting (only when the message is essentially just a greeting)
  if (raw.length <= 14 && /^(hi|hey|hello|salam|sal|privet|здрав|привет|aleykum)\b/i.test(raw)) return T.greeting;
  // Price
  if (has('qiymət', 'qiymet', 'neçə', 'nece manat', 'ödəniş', 'odenis', 'цена', 'цены', 'стоит', 'стоимость', 'сколько', 'оплат', 'price', 'cost', 'how much', 'fee', 'tuition')) return courseList(true);
  // Apply / enroll
  if (has('qeydiyyat', 'müraciət', 'muraciet', 'yazıl', 'yazil', 'başla', 'запис', 'поступ', 'регистр', 'заявк', 'apply', 'enroll', 'register', 'sign up', 'how to join', 'get started')) return `${T.apply}\n\n${fbContactBlock(locale)}`;
  // Schedule
  if (has('cədvəl', 'cedvel', 'qrafik', 'nə vaxt', 'ne vaxt', 'saat', 'dərs vaxt', 'расписан', 'график', 'во сколько', 'когда занят', 'время занят', 'schedule', 'timetable', 'what time', 'class time', 'when are')) return `${T.schedule}\n\n${fbContactBlock(locale)}`;
  // Certificate
  if (has('sertifikat', 'diplom', 'сертификат', 'диплом', 'certificate', 'diploma')) return T.certificate;
  // Corporate
  if (has('korporativ', 'şirkət', 'sirket', 'biznes', 'корпоратив', 'компан', 'для бизнеса', 'corporate', 'company', 'for business', 'b2b')) return `${T.corporate}\n\n${fbContactBlock(locale)}`;
  // Scholarship
  if (has('təqaüd', 'teqaud', 'стипенди', 'грант', 'scholarship', 'grant', 'financial aid')) return `${T.scholarship}\n\n${fbContactBlock(locale)}`;
  // Teachers
  if (has('müəllim', 'muellim', 'mentor', 'преподав', 'учител', 'ментор', 'тренер', 'teacher', 'instructor', 'tutor')) return T.teachers;
  // Contact / address / location
  if (has('əlaqə', 'elaqe', 'ünvan', 'unvan', 'telefon', 'zəng', 'harada', 'связ', 'контакт', 'адрес', 'телефон', 'где', 'позвон', 'contact', 'address', 'phone', 'where are', 'location', 'reach you', 'call you', 'email')) return fbContactBlock(locale);
  // Courses (generic)
  if (has('kurs', 'ixtisas', 'öyrən', 'oyren', 'proqram', 'təlim', 'курс', 'обуч', 'програм', 'направлен', 'научит', 'course', 'learn', 'program', 'study', 'offer', 'teach', 'what do you')) return courseList(false);
  // Default
  return `${T.helpHint}\n\n${fbContactBlock(locale)}`;
}

/* ------------------------------------------------------------------ */
/* Quick action presets per locale                                     */
/* ------------------------------------------------------------------ */

const quickMessages: Record<string, Record<string, string>> = {
  az: {
    quickCourses: 'Hansı kurslarınız var?',
    quickPrices: 'Kursların qiymətləri necədir?',
    quickSchedule: 'Dərs cədvəli necədir?',
    quickContact: 'Sizinlə necə əlaqə saxlamaq olar?',
  },
  ru: {
    quickCourses: 'Какие у вас курсы?',
    quickPrices: 'Сколько стоят курсы?',
    quickSchedule: 'Какое расписание занятий?',
    quickContact: 'Как с вами связаться?',
  },
  en: {
    quickCourses: 'What courses do you offer?',
    quickPrices: 'How much do courses cost?',
    quickSchedule: 'What is the class schedule?',
    quickContact: 'How can I contact you?',
  },
};

const quickIcons: Record<string, React.ReactNode> = {
  quickCourses: <BookOpen className="w-3 h-3" />,
  quickPrices: <DollarSign className="w-3 h-3" />,
  quickSchedule: <Clock className="w-3 h-3" />,
  quickContact: <Phone className="w-3 h-3" />,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CourseAdvisor() {
  const locale = useLocale();
  const t = useTranslations('advisor');

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch courses for context
  useEffect(() => {
    api
      .get<{ success: boolean; data: Course[] }>('/courses?limit=50')
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setCourses(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }, [messages, isStreaming]);

  // Welcome message on first open
  useEffect(() => {
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: t('welcome'),
        },
      ]);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  /* ---------- streaming chat ---------- */

  async function streamChat(allMessages: ChatMessage[]) {
    // В браузере используем относительный URL (nginx проксирует)
    const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
    let baseUrl = rawUrl.endsWith('/api') ? rawUrl : rawUrl + '/api';
    if (typeof window !== 'undefined' && baseUrl.includes('localhost')) {
      baseUrl = '/api';
    }

    const response = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: allMessages
          .filter((m) => m.role === 'user' || (m.role === 'assistant' && m.content))
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content })),
        locale,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('RATE_LIMIT');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.token) {
            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last && last.role === 'assistant') {
                return [
                  ...updated.slice(0, -1),
                  { ...last, content: last.content + data.token },
                ];
              }
              return updated;
            });
          }
          if (data.done) break;
          if (data.error) throw new Error(data.error);
        } catch {
          // Skip malformed lines
        }
      }
    }
  }

  /* ---------- offline fallback (no AI): answer from our own data ---------- */

  function showFallback(question: string, err: any) {
    const content =
      err?.message === 'RATE_LIMIT'
        ? t('errorRateLimit')
        : buildFallbackAnswer(question, courses, locale);
    const matched = err?.message === 'RATE_LIMIT' ? [] : parseCourseMarkers(content, courses);
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === 'assistant' && !last.content) {
        return [
          ...updated.slice(0, -1),
          { ...last, content, ...(matched.length > 0 ? { courses: matched } : {}) },
        ];
      }
      return updated;
    });
  }

  /* ---------- send handler ---------- */

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
    };

    const newMessages = [...messages, userMsg, assistantMsg];
    setMessages(newMessages);
    setInput('');
    setIsStreaming(true);

    try {
      await streamChat([...messages, userMsg]);

      // After streaming, parse course markers in the final message
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant' && last.content) {
          const matched = parseCourseMarkers(last.content, courses);
          if (matched.length > 0) {
            return [
              ...updated.slice(0, -1),
              { ...last, courses: matched },
            ];
          }
        }
        return updated;
      });
    } catch (err: any) {
      showFallback(text, err);
    } finally {
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleQuickAction(key: string) {
    const msg = quickMessages[locale]?.[key] || quickMessages.en[key];
    setInput(msg);
    // Trigger send on next tick after input is set
    setTimeout(() => {
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: msg,
      };
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput('');
      setIsStreaming(true);

      streamChat([...messages, userMsg])
        .then(() => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant' && last.content) {
              const matched = parseCourseMarkers(last.content, courses);
              if (matched.length > 0) {
                return [...updated.slice(0, -1), { ...last, courses: matched }];
              }
            }
            return updated;
          });
        })
        .catch((err: any) => {
          showFallback(msg, err);
        })
        .finally(() => {
          setIsStreaming(false);
        });
    }, 0);
  }

  function handleReset() {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: t('welcome'),
      },
    ]);
    setInput('');
    setIsStreaming(false);
  }

  /* ---------- render ---------- */

  const showQuickActions = messages.length <= 1 && !isStreaming;

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1.5 }}
            onClick={() => setOpen(true)}
            className={cn(
              'fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full',
              'bg-gradient-to-br from-primary-500 to-secondary-600',
              'shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
              'flex items-center justify-center',
              'hover:scale-110 active:scale-95 transition-transform duration-200'
            )}
            aria-label="AI Assistant"
          >
            <span className="absolute inset-0 rounded-full bg-primary-500 animate-ping opacity-20" />
            <Bot className="w-6 h-6 text-white relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-gray-200 dark:border-gray-700/50 flex flex-col"
            style={{ maxHeight: 'min(600px, calc(100vh - 4rem))' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{t('title')}</h3>
                  <p className="text-[11px] text-white/70">{t('subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title={t('restart')}
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0f1525]"
              style={{ minHeight: 280 }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="max-w-[90%] space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          {msg.content ? (
                            <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 text-sm text-gray-700 dark:text-gray-200 leading-relaxed shadow-sm">
                              {renderMessageText(msg.content)}
                            </div>
                          ) : (
                            /* Typing indicator */
                            <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Course cards */}
                        {msg.courses && msg.courses.length > 0 && (
                          <div className="pl-9 space-y-2.5">
                            {msg.courses.map((course) => (
                              <Link
                                key={course.id}
                                href={`/courses/${course.slug}`}
                                onClick={() => setOpen(false)}
                                className="block group"
                              >
                                <div className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all shadow-sm hover:shadow-md">
                                  <div className="flex items-start gap-3">
                                    {course.image ? (
                                      <img
                                        src={course.image}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-6 h-6 text-primary-500" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {getLocalized(course as unknown as Record<string, unknown>, 'title', locale)}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        {course.duration && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                            {formatDuration(course.duration, locale)}
                                          </span>
                                        )}
                                        {course.level && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                                            {course.level === 'BEGINNER'
                                              ? t('levelBeginner')
                                              : course.level === 'INTERMEDIATE'
                                                ? t('levelIntermediate')
                                                : t('levelAdvanced')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 shrink-0 mt-1 transition-colors" />
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 rounded-2xl rounded-tr-md bg-gradient-to-r from-primary-500 to-secondary-600 text-sm text-white shadow-sm max-w-[80%]">
                        {msg.content}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Quick action buttons — shown after welcome */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-2 pl-9"
                >
                  {(['quickCourses', 'quickPrices', 'quickSchedule', 'quickContact'] as const).map(
                    (key) => (
                      <button
                        key={key}
                        onClick={() => handleQuickAction(key)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                          'text-gray-600 dark:text-gray-300',
                          'hover:border-primary-300 dark:hover:border-primary-600',
                          'hover:bg-primary-50 dark:hover:bg-primary-900/20',
                          'hover:text-primary-600 dark:hover:text-primary-400',
                          'active:scale-95'
                        )}
                      >
                        {quickIcons[key]}
                        {t(key)}
                      </button>
                    )
                  )}
                </motion.div>
              )}
            </div>

            {/* Input area */}
            <div className="px-3 py-3 bg-white dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  disabled={isStreaming}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-gray-100 dark:bg-gray-700 border-0 outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 text-gray-800 dark:text-gray-200 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    'p-2.5 rounded-xl transition-all',
                    'bg-gradient-to-r from-primary-500 to-secondary-600 text-white',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'hover:shadow-lg hover:shadow-primary-500/30',
                    'active:scale-95'
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {t('poweredBy')}
                </span>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t('restart')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
