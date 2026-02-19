'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Code,
  Palette,
  BarChart3,
  Shield,
  Megaphone,
  ChevronRight,
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
  category?: { nameAz: string; nameRu: string; nameEn: string; slug: string };
}

type Step = 'welcome' | 'interest' | 'level' | 'goal' | 'results';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: { label: string; value: string; icon?: React.ReactNode }[];
  courses?: Course[];
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}Az`] as string) || '';
}

const interestIcons: Record<string, React.ReactNode> = {
  frontend: <Code className="w-4 h-4" />,
  backend: <Code className="w-4 h-4" />,
  design: <Palette className="w-4 h-4" />,
  data: <BarChart3 className="w-4 h-4" />,
  cyber: <Shield className="w-4 h-4" />,
  marketing: <Megaphone className="w-4 h-4" />,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function CourseAdvisor() {
  const locale = useLocale();
  const t = useTranslations('advisor');

  const [open, setOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<Step>('welcome');
  const [answers, setAnswers] = useState<{ interest: string; level: string; goal: string }>({
    interest: '',
    level: '',
    goal: '',
  });
  const [isTyping, setIsTyping] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch courses
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
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [messages, isTyping]);

  // Init welcome message
  useEffect(() => {
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
      addBotMessage(t('welcome'), getInterestOptions());
      setStep('interest');
    }
  }, [open]);

  /* ---------- message helpers ---------- */

  function addBotMessage(text: string, options?: Message['options'], coursesData?: Course[]) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          text,
          options,
          courses: coursesData,
        },
      ]);
    }, 600);
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [...prev, { id: Date.now().toString(), type: 'user', text }]);
  }

  /* ---------- option builders ---------- */

  function getInterestOptions(): Message['options'] {
    return [
      { label: t('interestFrontend'), value: 'frontend', icon: interestIcons.frontend },
      { label: t('interestBackend'), value: 'backend', icon: interestIcons.backend },
      { label: t('interestDesign'), value: 'design', icon: interestIcons.design },
      { label: t('interestData'), value: 'data', icon: interestIcons.data },
      { label: t('interestCyber'), value: 'cyber', icon: interestIcons.cyber },
      { label: t('interestMarketing'), value: 'marketing', icon: interestIcons.marketing },
    ];
  }

  function getLevelOptions(): Message['options'] {
    return [
      { label: t('levelBeginner'), value: 'BEGINNER' },
      { label: t('levelIntermediate'), value: 'INTERMEDIATE' },
      { label: t('levelAdvanced'), value: 'ADVANCED' },
    ];
  }

  function getGoalOptions(): Message['options'] {
    return [
      { label: t('goalCareer'), value: 'career' },
      { label: t('goalSkills'), value: 'skills' },
      { label: t('goalFreelance'), value: 'freelance' },
    ];
  }

  /* ---------- recommendation engine ---------- */

  function getRecommendations(interest: string, level: string): Course[] {
    // Keyword mapping for matching courses to interests
    const keywords: Record<string, string[]> = {
      frontend: ['frontend', 'front-end', 'react', 'javascript', 'html', 'css', 'vue', 'angular', 'web'],
      backend: ['backend', 'back-end', 'node', 'python', 'java', 'server', 'api', 'database', 'sql'],
      design: ['design', 'ui', 'ux', 'figma', 'graphic', 'dizayn', 'дизайн'],
      data: ['data', 'analytic', 'python', 'machine', 'ai', 'power bi', 'excel', 'sql', 'məlumat', 'данн'],
      cyber: ['cyber', 'security', 'network', 'təhlükəsizlik', 'безопасност', 'hacking', 'pentest'],
      marketing: ['marketing', 'seo', 'smm', 'digital', 'rəqəmsal', 'маркетинг', 'reklam'],
    };

    const interestKeywords = keywords[interest] || [];

    let results = courses.filter((course) => {
      const title = `${course.titleAz} ${course.titleRu} ${course.titleEn}`.toLowerCase();
      const desc = `${course.shortDescAz || ''} ${course.shortDescRu || ''} ${course.shortDescEn || ''}`.toLowerCase();
      const catName = course.category
        ? `${course.category.nameAz} ${course.category.nameRu} ${course.category.nameEn}`.toLowerCase()
        : '';
      const searchText = `${title} ${desc} ${catName}`;

      return interestKeywords.some((kw) => searchText.includes(kw));
    });

    // Filter by level if available
    if (level && results.length > 3) {
      const levelFiltered = results.filter((c) => c.level === level);
      if (levelFiltered.length > 0) {
        results = levelFiltered;
      }
    }

    // Return top 3
    return results.slice(0, 3);
  }

  /* ---------- flow handler ---------- */

  function handleOptionSelect(value: string, label: string) {
    addUserMessage(label);

    if (step === 'interest') {
      setAnswers((prev) => ({ ...prev, interest: value }));
      setStep('level');
      setTimeout(() => {
        addBotMessage(t('askLevel'), getLevelOptions());
      }, 300);
    } else if (step === 'level') {
      setAnswers((prev) => ({ ...prev, level: value }));
      setStep('goal');
      setTimeout(() => {
        addBotMessage(t('askGoal'), getGoalOptions());
      }, 300);
    } else if (step === 'goal') {
      const newAnswers = { ...answers, goal: value };
      setAnswers(newAnswers);
      setStep('results');

      setTimeout(() => {
        const recommended = getRecommendations(newAnswers.interest, newAnswers.level);
        if (recommended.length > 0) {
          addBotMessage(t('resultsFound'), undefined, recommended);
        } else {
          addBotMessage(t('noResults'));
        }
      }, 300);
    }
  }

  function handleReset() {
    setMessages([]);
    setAnswers({ interest: '', level: '', goal: '' });
    setStep('interest');
    setIsTyping(false);
    setTimeout(() => {
      addBotMessage(t('welcome'), getInterestOptions());
    }, 200);
  }

  /* ---------- render ---------- */

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
            aria-label="Course Advisor"
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
                {step === 'results' && (
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title={t('restart')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
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
              style={{ minHeight: 300 }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'flex',
                      msg.type === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.type === 'bot' ? (
                      <div className="max-w-[90%] space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 text-sm text-gray-700 dark:text-gray-200 leading-relaxed shadow-sm">
                            {msg.text}
                          </div>
                        </div>

                        {/* Options */}
                        {msg.options && (
                          <div className="pl-9 flex flex-wrap gap-2">
                            {msg.options.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => handleOptionSelect(opt.value, opt.label)}
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
                                {opt.icon}
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Course results */}
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
                                            {course.duration}
                                          </span>
                                        )}
                                        {course.level && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                                            {course.level === 'BEGINNER' ? t('levelBeginner') :
                                             course.level === 'INTERMEDIATE' ? t('levelIntermediate') :
                                             t('levelAdvanced')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 shrink-0 mt-1 transition-colors" />
                                  </div>
                                </div>
                              </Link>
                            ))}

                            {/* View all link */}
                            <Link
                              href="/courses"
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-primary-500 hover:text-primary-600 transition-colors"
                            >
                              {t('viewAll')}
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="px-4 py-2.5 rounded-2xl rounded-tr-md bg-gradient-to-r from-primary-500 to-secondary-600 text-sm text-white shadow-sm max-w-[80%]">
                        {msg.text}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-white dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700/50 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 dark:text-gray-500">
                  {t('poweredBy')}
                </span>
                {step === 'results' && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1 text-[11px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    {t('restart')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
