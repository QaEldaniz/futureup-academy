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
  HelpCircle,
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

type Step =
  | 'welcome'
  | 'interest'
  | 'level'
  | 'goal'
  | 'results'
  | 'quiz_q1'
  | 'quiz_q2'
  | 'quiz_q3'
  | 'quiz_q4'
  | 'quiz_result';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  options?: { label: string; value: string; icon?: React.ReactNode }[];
  courses?: Course[];
}

/* ------------------------------------------------------------------ */
/* Quiz scoring logic                                                  */
/* ------------------------------------------------------------------ */

// Each quiz answer adds points to relevant interest areas
const quizScoring: Record<string, Record<string, number>> = {
  // Q1: What activity do you enjoy most?
  q1_create: { frontend: 2, design: 3, marketing: 1 },
  q1_solve: { backend: 3, data: 2, cyber: 1 },
  q1_analyze: { data: 3, backend: 1, cyber: 2 },
  q1_communicate: { marketing: 3, design: 1, frontend: 1 },

  // Q2: What interests you on the internet?
  q2_websites: { frontend: 3, design: 2, backend: 1 },
  q2_apps: { backend: 3, frontend: 2 },
  q2_social: { marketing: 3, design: 1 },
  q2_security: { cyber: 3, backend: 1 },

  // Q3: What type of work do you prefer?
  q3_visual: { design: 3, frontend: 2 },
  q3_logic: { backend: 3, data: 2, cyber: 1 },
  q3_numbers: { data: 3, backend: 1 },
  q3_people: { marketing: 3, design: 1 },

  // Q4: What's your dream project?
  q4_website: { frontend: 3, backend: 2, design: 1 },
  q4_mobile: { backend: 2, frontend: 2 },
  q4_business: { data: 3, marketing: 2 },
  q4_protect: { cyber: 3, backend: 1 },
};

function calculateQuizResult(quizAnswers: string[]): string {
  const scores: Record<string, number> = {
    frontend: 0,
    backend: 0,
    design: 0,
    data: 0,
    cyber: 0,
    marketing: 0,
  };

  quizAnswers.forEach((answer) => {
    const scoring = quizScoring[answer];
    if (scoring) {
      Object.entries(scoring).forEach(([area, points]) => {
        scores[area] += points;
      });
    }
  });

  // Find area with highest score
  let maxArea = 'frontend';
  let maxScore = 0;
  Object.entries(scores).forEach(([area, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxArea = area;
    }
  });

  return maxArea;
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

const interestLabels: Record<string, string> = {
  frontend: 'interestFrontend',
  backend: 'interestBackend',
  design: 'interestDesign',
  data: 'interestData',
  cyber: 'interestCyber',
  marketing: 'interestMarketing',
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
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
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

  // Auto-scroll — delay a bit more so buttons/options fully render before scroll
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 150);
      // Second pass to catch any late-rendering content (buttons/options)
      setTimeout(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      }, 500);
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
      { label: t('interestUnsure'), value: 'unsure', icon: <HelpCircle className="w-4 h-4" /> },
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

  /* ---------- quiz option builders ---------- */

  function getQuizQ1Options(): Message['options'] {
    return [
      { label: t('quizQ1_create'), value: 'q1_create' },
      { label: t('quizQ1_solve'), value: 'q1_solve' },
      { label: t('quizQ1_analyze'), value: 'q1_analyze' },
      { label: t('quizQ1_communicate'), value: 'q1_communicate' },
    ];
  }

  function getQuizQ2Options(): Message['options'] {
    return [
      { label: t('quizQ2_websites'), value: 'q2_websites' },
      { label: t('quizQ2_apps'), value: 'q2_apps' },
      { label: t('quizQ2_social'), value: 'q2_social' },
      { label: t('quizQ2_security'), value: 'q2_security' },
    ];
  }

  function getQuizQ3Options(): Message['options'] {
    return [
      { label: t('quizQ3_visual'), value: 'q3_visual' },
      { label: t('quizQ3_logic'), value: 'q3_logic' },
      { label: t('quizQ3_numbers'), value: 'q3_numbers' },
      { label: t('quizQ3_people'), value: 'q3_people' },
    ];
  }

  function getQuizQ4Options(): Message['options'] {
    return [
      { label: t('quizQ4_website'), value: 'q4_website' },
      { label: t('quizQ4_mobile'), value: 'q4_mobile' },
      { label: t('quizQ4_business'), value: 'q4_business' },
      { label: t('quizQ4_protect'), value: 'q4_protect' },
    ];
  }

  /* ---------- recommendation engine ---------- */

  function getRecommendations(interest: string, level: string): Course[] {
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

    if (level && results.length > 3) {
      const levelFiltered = results.filter((c) => c.level === level);
      if (levelFiltered.length > 0) {
        results = levelFiltered;
      }
    }

    return results.slice(0, 3);
  }

  /* ---------- flow handler ---------- */

  function handleOptionSelect(value: string, label: string) {
    addUserMessage(label);

    if (step === 'interest') {
      if (value === 'unsure') {
        // Start the quiz flow
        setStep('quiz_q1');
        setQuizAnswers([]);
        setTimeout(() => {
          addBotMessage(t('quizIntro'), undefined);
          setTimeout(() => {
            addBotMessage(t('quizQ1'), getQuizQ1Options());
          }, 800);
        }, 300);
      } else {
        setAnswers((prev) => ({ ...prev, interest: value }));
        setStep('level');
        setTimeout(() => {
          addBotMessage(t('askLevel'), getLevelOptions());
        }, 300);
      }
    } else if (step === 'quiz_q1') {
      setQuizAnswers((prev) => [...prev, value]);
      setStep('quiz_q2');
      setTimeout(() => {
        addBotMessage(t('quizQ2'), getQuizQ2Options());
      }, 300);
    } else if (step === 'quiz_q2') {
      setQuizAnswers((prev) => [...prev, value]);
      setStep('quiz_q3');
      setTimeout(() => {
        addBotMessage(t('quizQ3'), getQuizQ3Options());
      }, 300);
    } else if (step === 'quiz_q3') {
      setQuizAnswers((prev) => [...prev, value]);
      setStep('quiz_q4');
      setTimeout(() => {
        addBotMessage(t('quizQ4'), getQuizQ4Options());
      }, 300);
    } else if (step === 'quiz_q4') {
      const allQuizAnswers = [...quizAnswers, value];
      setQuizAnswers(allQuizAnswers);

      // Calculate result
      const detectedInterest = calculateQuizResult(allQuizAnswers);
      setAnswers((prev) => ({ ...prev, interest: detectedInterest }));

      // Show quiz result with detected area name
      const areaLabelKey = interestLabels[detectedInterest] || 'interestFrontend';
      const areaName = t(areaLabelKey);

      setStep('level');
      setTimeout(() => {
        addBotMessage(
          t('quizResultMsg', { area: areaName }),
          undefined
        );
        setTimeout(() => {
          addBotMessage(t('askLevel'), getLevelOptions());
        }, 1000);
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
    setQuizAnswers([]);
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
                {(step === 'results' || step.startsWith('quiz_')) && (
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
                          <div className="pl-9 space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {msg.options
                                .filter((opt) => opt.value !== 'unsure')
                                .map((opt) => (
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
                            {/* "Not sure" button — full width, separated */}
                            {msg.options.find((opt) => opt.value === 'unsure') && (
                              <button
                                onClick={() => {
                                  const unsureOpt = msg.options!.find((opt) => opt.value === 'unsure')!;
                                  handleOptionSelect(unsureOpt.value, unsureOpt.label);
                                }}
                                className={cn(
                                  'w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                                  'bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-300 dark:border-amber-700',
                                  'text-amber-600 dark:text-amber-400',
                                  'hover:border-amber-400 dark:hover:border-amber-500',
                                  'hover:bg-amber-100 dark:hover:bg-amber-900/30',
                                  'hover:text-amber-700 dark:hover:text-amber-300',
                                  'active:scale-[0.98]'
                                )}
                              >
                                <HelpCircle className="w-4 h-4" />
                                {msg.options.find((opt) => opt.value === 'unsure')!.label}
                              </button>
                            )}
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
                {(step === 'results' || step.startsWith('quiz_')) && (
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
