'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Github,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Teacher {
  initials: string;
  nameKey: string;
  roleKey: string;
  gradient: string;
  socialLinkedin: string;
  socialGithub: string;
}

const teachers: Teacher[] = [
  {
    initials: 'AH',
    nameKey: 'teacher1Name',
    roleKey: 'teacher1Role',
    gradient: 'from-primary-500 to-secondary-600',
    socialLinkedin: '#',
    socialGithub: '#',
  },
  {
    initials: 'NM',
    nameKey: 'teacher2Name',
    roleKey: 'teacher2Role',
    gradient: 'from-accent-500 to-secondary-500',
    socialLinkedin: '#',
    socialGithub: '#',
  },
  {
    initials: 'SA',
    nameKey: 'teacher3Name',
    roleKey: 'teacher3Role',
    gradient: 'from-pink-500 to-primary-500',
    socialLinkedin: '#',
    socialGithub: '#',
  },
  {
    initials: 'FK',
    nameKey: 'teacher4Name',
    roleKey: 'teacher4Role',
    gradient: 'from-green-500 to-accent-500',
    socialLinkedin: '#',
    socialGithub: '#',
  },
];

function TeacherCard({ teacher }: { teacher: Teacher }) {
  const t = useTranslations('home');

  return (
    <div
      className={cn(
        'group flex-shrink-0 w-[280px] sm:w-[300px] classical-card',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'rounded-lg overflow-hidden gold-top-border',
        'hover:-translate-y-1',
        'transition-all duration-300'
      )}
    >
      {/* Photo placeholder */}
      <div className="relative h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        {/* Avatar circle */}
        <div
          className={cn(
            'relative w-24 h-24 rounded-full flex items-center justify-center',
            'bg-primary-500 border-3 border-secondary-400',
            'shadow-xl',
            'group-hover:scale-110 transition-transform duration-300'
          )}
        >
          <span className="text-2xl font-bold text-white tracking-wider">
            {teacher.initials}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-bold font-serif-heading text-gray-900 dark:text-white mb-1">
          {t(`teachers.${teacher.nameKey}`)}
        </h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-4">
          {t(`teachers.${teacher.roleKey}`)}
        </p>

        {/* Social links */}
        <div className="flex items-center gap-2">
          <a
            href={teacher.socialLinkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center transition-colors"
          >
            <Linkedin className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
          </a>
          <a
            href={teacher.socialGithub}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center transition-colors"
          >
            <Github className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
          </a>
        </div>
      </div>
    </div>
  );
}

export function TeachersSection() {
  const t = useTranslations('home');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-20 sm:py-28 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <span className="section-subtitle mb-3 block">— Our Faculty —</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading tracking-elegant text-gray-900 dark:text-white mb-3">
              {t('teachers.title')}
            </h2>
            {/* Ornamental underline */}
            <div className="flex items-center gap-0 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-300 dark:to-secondary-700" />
              <div className="w-1.5 h-1.5 rotate-45 bg-secondary-500 mx-2" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-secondary-300 dark:to-secondary-700" />
            </div>
            <p className="max-w-lg text-lg text-gray-500 dark:text-gray-400">
              {t('teachers.subtitle')}
            </p>
          </div>

          {/* Carousel controls + View All */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => scroll('left')}
              className={cn(
                'w-10 h-10 rounded-md flex items-center justify-center',
                'border border-gray-200 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'text-gray-500 hover:text-primary-500',
                'transition-colors'
              )}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className={cn(
                'w-10 h-10 rounded-md flex items-center justify-center',
                'border border-gray-200 dark:border-gray-700',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'text-gray-500 hover:text-primary-500',
                'transition-colors'
              )}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {teachers.map((teacher) => (
            <div key={teacher.nameKey} className="snap-start">
              <TeacherCard teacher={teacher} />
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="text-center mt-10">
          <Link href="/teachers">
            <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t('teachers.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
