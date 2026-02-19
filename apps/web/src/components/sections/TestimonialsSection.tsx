'use client';

import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  nameKey: string;
  courseKey: string;
  textKey: string;
  rating: number;
  initials: string;
  gradient: string;
}

const testimonials: Testimonial[] = [
  {
    nameKey: 'testimonial1Name',
    courseKey: 'testimonial1Course',
    textKey: 'testimonial1Text',
    rating: 5,
    initials: 'EM',
    gradient: 'from-primary-500 to-secondary-600',
  },
  {
    nameKey: 'testimonial2Name',
    courseKey: 'testimonial2Course',
    textKey: 'testimonial2Text',
    rating: 5,
    initials: 'RA',
    gradient: 'from-accent-500 to-primary-500',
  },
  {
    nameKey: 'testimonial3Name',
    courseKey: 'testimonial3Course',
    textKey: 'testimonial3Text',
    rating: 5,
    initials: 'LH',
    gradient: 'from-pink-500 to-secondary-500',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
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
      {/* Decorative quote mark */}
      <div className="absolute top-5 right-6 pointer-events-none">
        <Quote className="w-10 h-10 text-primary-100 dark:text-primary-900/30 fill-primary-100 dark:fill-primary-900/30" />
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-0.5 mb-5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Quote text */}
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6 flex-1 text-sm sm:text-base">
        &ldquo;{t(`testimonials.${testimonial.textKey}`)}&rdquo;
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
        {/* Avatar */}
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

export function TestimonialsSection() {
  const t = useTranslations('home');

  return (
    <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.nameKey} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
}
