'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  Code2,
  Server,
  Palette,
  BarChart3,
  Shield,
  Megaphone,
  ArrowRight,
  Clock,
  Signal,
  Users,
  Baby,
  Gamepad2,
  Blocks,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CourseCard {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  level: string;
  duration: string;
  gradient: string;
  borderGradient: string;
}

const adultCourses: CourseCard[] = [
  {
    icon: Code2,
    titleKey: 'frontend',
    descriptionKey: 'frontendDesc',
    level: 'Beginner',
    duration: '6 months',
    gradient: 'from-blue-500 to-cyan-500',
    borderGradient: 'from-blue-500/50 to-cyan-500/50',
  },
  {
    icon: Server,
    titleKey: 'backend',
    descriptionKey: 'backendDesc',
    level: 'Intermediate',
    duration: '6 months',
    gradient: 'from-green-500 to-emerald-500',
    borderGradient: 'from-green-500/50 to-emerald-500/50',
  },
  {
    icon: Palette,
    titleKey: 'design',
    descriptionKey: 'designDesc',
    level: 'Beginner',
    duration: '4 months',
    gradient: 'from-pink-500 to-rose-500',
    borderGradient: 'from-pink-500/50 to-rose-500/50',
  },
  {
    icon: BarChart3,
    titleKey: 'data',
    descriptionKey: 'dataDesc',
    level: 'Intermediate',
    duration: '5 months',
    gradient: 'from-purple-500 to-violet-500',
    borderGradient: 'from-purple-500/50 to-violet-500/50',
  },
  {
    icon: Shield,
    titleKey: 'cyber',
    descriptionKey: 'cyberDesc',
    level: 'Advanced',
    duration: '6 months',
    gradient: 'from-red-500 to-orange-500',
    borderGradient: 'from-red-500/50 to-orange-500/50',
  },
  {
    icon: Megaphone,
    titleKey: 'marketing',
    descriptionKey: 'marketingDesc',
    level: 'Beginner',
    duration: '3 months',
    gradient: 'from-amber-500 to-yellow-500',
    borderGradient: 'from-amber-500/50 to-yellow-500/50',
  },
];

const kidsCourses: CourseCard[] = [
  {
    icon: Blocks,
    titleKey: 'scratch',
    descriptionKey: 'scratchDesc',
    level: 'Beginner',
    duration: '3 months',
    gradient: 'from-orange-500 to-amber-500',
    borderGradient: 'from-orange-500/50 to-amber-500/50',
  },
  {
    icon: Gamepad2,
    titleKey: 'pythonKids',
    descriptionKey: 'pythonKidsDesc',
    level: 'Beginner',
    duration: '4 months',
    gradient: 'from-green-500 to-teal-500',
    borderGradient: 'from-green-500/50 to-teal-500/50',
  },
  {
    icon: Code2,
    titleKey: 'webKids',
    descriptionKey: 'webKidsDesc',
    level: 'Intermediate',
    duration: '4 months',
    gradient: 'from-sky-500 to-blue-500',
    borderGradient: 'from-sky-500/50 to-blue-500/50',
  },
];

function CourseCardComponent({ course, isKids }: { course: CourseCard; isKids: boolean }) {
  const t = useTranslations('home');
  const Icon = course.icon;

  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden',
        'hover:-translate-y-1',
        'transition-all duration-300',
        isKids
          ? 'rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-orange-950/40 dark:to-amber-950/30 border-2 border-orange-200/60 dark:border-orange-800/30 hover:shadow-2xl hover:shadow-orange-500/15'
          : 'rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:shadow-primary-500/10'
      )}
    >
      {/* Top gradient border */}
      <div className={cn('w-full bg-gradient-to-r', course.gradient, isKids ? 'h-2' : 'h-1')} />

      <div className="flex flex-col flex-1 p-6">
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center mb-4',
            'bg-gradient-to-br',
            course.gradient,
            'shadow-lg',
            isKids ? 'w-14 h-14 rounded-2xl' : 'w-12 h-12 rounded-xl',
          )}
        >
          <Icon className={cn('text-white', isKids ? 'w-7 h-7' : 'w-6 h-6')} />
        </div>

        {/* Title */}
        <h3 className={cn(
          'font-bold mb-2 transition-colors',
          isKids
            ? 'text-xl text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
            : 'text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400'
        )}>
          {t(`courses.${course.titleKey}`)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
          {t(`courses.${course.descriptionKey}`)}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Signal className={cn('w-3.5 h-3.5', isKids ? 'text-orange-500' : 'text-primary-500')} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {course.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className={cn('w-3.5 h-3.5', isKids ? 'text-orange-500' : 'text-primary-500')} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {course.duration}
            </span>
          </div>
        </div>

        {/* Arrow button */}
        <div className={cn(
          'flex items-center justify-between pt-4 border-t',
          isKids ? 'border-orange-200/50 dark:border-orange-800/30' : 'border-gray-100 dark:border-gray-800'
        )}>
          <span className={cn(
            'text-sm font-semibold group-hover:underline',
            isKids ? 'text-orange-600 dark:text-orange-400' : 'text-primary-600 dark:text-primary-400'
          )}>
            {t('courses.learnMore')}
          </span>
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
            isKids
              ? 'bg-orange-100 dark:bg-orange-900/20 group-hover:bg-orange-500'
              : 'bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-500'
          )}>
            <ArrowRight className={cn(
              'w-4 h-4 group-hover:text-white transition-colors',
              isKids ? 'text-orange-500' : 'text-primary-500'
            )} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoursesSection() {
  const t = useTranslations('home');
  const [activeTab, setActiveTab] = useState<'adults' | 'kids'>('adults');
  const isKids = activeTab === 'kids';
  const currentCourses = isKids ? kidsCourses : adultCourses;

  return (
    <section className={cn(
      'py-20 sm:py-28 transition-colors duration-500',
      isKids
        ? 'bg-gradient-to-b from-orange-50/50 to-amber-50/30 dark:from-orange-950/10 dark:to-amber-950/5'
        : 'bg-gray-50/50 dark:bg-gray-900/30'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <div className="relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-secondary-500/10">
              <img
                src="/images/coding-workspace.jpg"
                alt="Modern coding workspace"
                className="w-full h-[280px] object-cover"
              />
            </div>
            <div className={cn(
              'absolute -top-3 -right-3 w-20 h-20 rounded-2xl opacity-15 blur-xl',
              isKids
                ? 'bg-gradient-to-br from-orange-500 to-amber-500'
                : 'bg-gradient-to-br from-primary-500 to-accent-500'
            )} />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {isKids ? t('courses.kidsTitle') : t('courses.title')}
            </h2>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-gray-500 dark:text-gray-400 mb-6">
              {isKids ? t('courses.kidsSubtitle') : t('courses.subtitle')}
            </p>

            {/* Mini tabs */}
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab('adults')}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                  activeTab === 'adults'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                )}
              >
                <Users className="w-4 h-4" />
                {t('courses.adultsLabel')}
              </button>
              <button
                onClick={() => setActiveTab('kids')}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300',
                  activeTab === 'kids'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                )}
              >
                <Baby className="w-4 h-4" />
                {t('courses.kidsLabel')}
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12',
        )}>
          {currentCourses.map((course) => (
            <Link key={course.titleKey} href="/courses" className="cursor-pointer">
              <CourseCardComponent course={course} isKids={isKids} />
            </Link>
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link href="/courses">
            <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t('courses.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
