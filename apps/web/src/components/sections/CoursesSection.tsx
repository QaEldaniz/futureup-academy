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
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCard {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  level: string;
  duration: string;
  gradient: string;
  borderGradient: string;
}

const courses: CourseCard[] = [
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

function CourseCardComponent({ course }: { course: CourseCard }) {
  const t = useTranslations('home');
  const Icon = course.icon;

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'hover:shadow-2xl hover:shadow-primary-500/10',
        'hover:-translate-y-1',
        'transition-all duration-300'
      )}
    >
      {/* Top gradient border */}
      <div className={cn('h-1 w-full bg-gradient-to-r', course.gradient)} />

      <div className="flex flex-col flex-1 p-6">
        {/* Icon */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
            'bg-gradient-to-br',
            course.gradient,
            'shadow-lg',
          )}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {t(`courses.${course.titleKey}`)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
          {t(`courses.${course.descriptionKey}`)}
        </p>

        {/* Meta info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {course.level}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {course.duration}
            </span>
          </div>
        </div>

        {/* Arrow button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">
            {t('courses.learnMore')}
          </span>
          <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
            <ArrowRight className="w-4 h-4 text-primary-500 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoursesSection() {
  const t = useTranslations('home');

  return (
    <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-gray-900/30">
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
            <div className="absolute -top-3 -right-3 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 opacity-15 blur-xl" />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('courses.title')}
            </h2>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-gray-500 dark:text-gray-400">
              {t('courses.subtitle')}
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {courses.map((course) => (
            <Link key={course.titleKey} href="/courses" className="cursor-pointer">
              <CourseCardComponent course={course} />
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
