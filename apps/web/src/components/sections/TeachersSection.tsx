'use client';

import { useRef, useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Github,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ApiTeacher {
  id: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  specialization: string;
  photo?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}En`] as string) || '';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

function TeacherCard({ teacher, locale }: { teacher: ApiTeacher; locale: string }) {
  const name = getLocalized(teacher as unknown as Record<string, unknown>, 'name', locale);
  const initials = getInitials(name);

  return (
    <div className={cn(
      'group flex-shrink-0 w-[280px] sm:w-[300px] classical-card',
      'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800',
      'rounded-lg overflow-hidden gold-top-border hover:-translate-y-1 transition-all duration-300'
    )}>
      {/* Photo / Avatar */}
      <div className="relative h-48 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        {teacher.photo ? (
          <img
            src={teacher.photo}
            alt={name}
            className="relative w-24 h-24 rounded-full object-cover border-3 border-secondary-400 shadow-xl group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className={cn(
            'relative w-24 h-24 rounded-full flex items-center justify-center',
            'bg-primary-500 border-3 border-secondary-400 shadow-xl',
            'group-hover:scale-110 transition-transform duration-300'
          )}>
            <span className="text-2xl font-bold text-white tracking-wider">{initials}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base font-bold font-serif-heading text-gray-900 dark:text-white mb-1">
          {name}
        </h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-4">
          {teacher.specialization}
        </p>
        <div className="flex items-center gap-2">
          {teacher.linkedin && (
            <a
              href={teacher.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center transition-colors"
            >
              <Linkedin className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
            </a>
          )}
          {teacher.github && (
            <a
              href={teacher.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex items-center justify-center transition-colors"
            >
              <Github className="w-4 h-4 text-gray-400 hover:text-primary-500 transition-colors" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function TeachersSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const res = await api.get<{ success: boolean; data: ApiTeacher[] }>('/teachers');
        setTeachers(res.data || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchTeachers();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -320 : 320,
      behavior: 'smooth',
    });
  };

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-bg-light dark:bg-bg-dark">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (teachers.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div>
            <span className="section-subtitle mb-3 block">— {t('teachers.faculty')} —</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading tracking-elegant text-gray-900 dark:text-white mb-3">
              {t('teachers.title')}
            </h2>
            <div className="flex items-center gap-0 mb-4">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-300 dark:to-secondary-700" />
              <div className="w-1.5 h-1.5 rotate-45 bg-secondary-500 mx-2" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-secondary-300 dark:to-secondary-700" />
            </div>
            <p className="max-w-lg text-lg text-gray-500 dark:text-gray-400">
              {t('teachers.subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-500 transition-colors" aria-label="Scroll left">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-primary-500 transition-colors" aria-label="Scroll right">
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
            <div key={teacher.id} className="snap-start">
              <TeacherCard teacher={teacher} locale={locale} />
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
