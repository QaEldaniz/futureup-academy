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
    const rawUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
    const baseUrl = rawUrl.endsWith('/api') ? rawUrl : rawUrl + '/api';

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
      throw new Error(`HTTP ${response.status}`);
    }

    const reader = response.body!.getReader();
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
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant' && !last.content) {
          return [
            ...updated.slice(0, -1),
            { ...last, content: t('errorGeneric') },
          ];
        }
        return updated;
      });
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
        .catch(() => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === 'assistant' && !last.content) {
              return [...updated.slice(0, -1), { ...last, content: t('errorGeneric') }];
            }
            return updated;
          });
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
                                            {course.duration}
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
