'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Star, Quote, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

interface Testimonial {
  id: string;
  name: string;
  photo?: string;
  textAz: string;
  textRu: string;
  textEn: string;
  rating: number;
  courseAz?: string;
  courseRu?: string;
  courseEn?: string;
  order: number;
}

// Fallback when API not available
const fallbackTestimonials = [
  {
    nameKey: 'testimonial1Name',
    courseKey: 'testimonial1Course',
    textKey: 'testimonial1Text',
    rating: 5,
    initials: 'FƏ',
    gradient: 'from-primary-500 to-secondary-600',
  },
  {
    nameKey: 'testimonial2Name',
    courseKey: 'testimonial2Course',
    textKey: 'testimonial2Text',
    rating: 5,
    initials: 'GH',
    gradient: 'from-accent-500 to-primary-500',
  },
  {
    nameKey: 'testimonial3Name',
    courseKey: 'testimonial3Course',
    textKey: 'testimonial3Text',
    rating: 5,
    initials: 'RQ',
    gradient: 'from-pink-500 to-secondary-500',
  },
];

const gradients = [
  'from-primary-500 to-secondary-600',
  'from-accent-500 to-primary-500',
  'from-pink-500 to-secondary-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
  'from-violet-500 to-fuchsia-500',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}Az`] as string) || '';
}

/* ------------------------------------------------------------------ */
/* Fallback static card                                                */
/* ------------------------------------------------------------------ */

function StaticTestimonialCard({
  testimonial,
}: {
  testimonial: (typeof fallbackTestimonials)[number];
}) {
  const t = useTranslations('home');

  return (
    <div
      className={cn(
        'group relative flex flex-col p-6 sm:p-8 rounded-2xl',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'hover:shadow-xl hover:shadow-primary-500/5',
        'hover:-translate-y-0.5',
        'transition-all duration-300'
      )}
    >
      <div className="absolute top-5 right-6 pointer-events-none">
        <Quote className="w-10 h-10 text-primary-100 dark:text-primary-900/30 fill-primary-100 dark:fill-primary-900/30" />
      </div>
      <div className="flex items-center gap-0.5 mb-5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1 text-sm sm:text-base">
        &ldquo;{t(`testimonials.${testimonial.textKey}`)}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
            'bg-gradient-to-br',
            testimonial.gradient
          )}
        >
          <span className="text-xs font-bold text-white">{testimonial.initials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {t(`testimonials.${testimonial.nameKey}`)}
          </p>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
            {t(`testimonials.${testimonial.courseKey}`)}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dynamic API card                                                    */
/* ------------------------------------------------------------------ */

function DynamicTestimonialCard({
  testimonial,
  index,
  locale,
}: {
  testimonial: Testimonial;
  index: number;
  locale: string;
}) {
  const text = getLocalized(testimonial as unknown as Record<string, unknown>, 'text', locale);
  const course = getLocalized(testimonial as unknown as Record<string, unknown>, 'course', locale);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'group relative flex flex-col p-6 sm:p-8 rounded-2xl',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'hover:shadow-xl hover:shadow-primary-500/5',
        'hover:-translate-y-0.5',
        'transition-all duration-300'
      )}
    >
      {/* Decorative quote */}
      <div className="absolute top-5 right-6 pointer-events-none">
        <Quote className="w-10 h-10 text-primary-100 dark:text-primary-900/30 fill-primary-100 dark:fill-primary-900/30" />
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-0.5 mb-5">
        {Array.from({ length: Math.min(testimonial.rating, 5) }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
        {Array.from({ length: Math.max(0, 5 - testimonial.rating) }).map((_, i) => (
          <Star key={`e-${i}`} className="w-4 h-4 text-gray-200 dark:text-gray-700" />
        ))}
      </div>

      {/* Quote text */}
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1 text-sm sm:text-base line-clamp-5">
        &ldquo;{text}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
        {testimonial.photo ? (
          <img
            src={testimonial.photo}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
              'bg-gradient-to-br',
              gradients[index % gradients.length]
            )}
          >
            <span className="text-xs font-bold text-white">{getInitials(testimonial.name)}</span>
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
          {course && (
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{course}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Section                                                        */
/* ------------------------------------------------------------------ */

export function TestimonialsSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isApi, setIsApi] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Testimonial[] }>('/testimonials')
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setTestimonials(res.data.sort((a, b) => a.order - b.order));
          setIsApi(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200/50 dark:border-yellow-800/30 mb-4"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">
              {t('testimonials.subtitle')}
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white"
          >
            {t('testimonials.title')}
          </motion.h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isApi
            ? testimonials.map((testimonial, index) => (
                <DynamicTestimonialCard
                  key={testimonial.id}
                  testimonial={testimonial}
                  index={index}
                  locale={locale}
                />
              ))
            : fallbackTestimonials.map((testimonial) => (
                <StaticTestimonialCard key={testimonial.nameKey} testimonial={testimonial} />
              ))}
        </div>
      </div>
    </section>
  );
}
