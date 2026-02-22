'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-light dark:bg-bg-dark parchment-bg">
      {/* Subtle gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-secondary-50/60 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/3 dark:bg-primary-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-500/3 dark:bg-secondary-500/3 rounded-full blur-3xl" />
      </div>

      {/* Subtle grid overlay — finer, more elegant */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.02)_1px,transparent_1px)] bg-[size:48px_48px] dark:bg-[linear-gradient(rgba(27,42,74,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.04)_1px,transparent_1px)]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Classical badge — Est. year */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-md bg-primary-100/60 dark:bg-primary-900/30 border border-primary-200/40 dark:border-primary-700/30 mb-8">
          <div className="h-px w-6 bg-secondary-400/60" />
          <span className="text-xs font-serif-heading font-semibold tracking-regal text-primary-600 dark:text-primary-300 uppercase">
            Est. 2024
          </span>
          <div className="w-1 h-1 rotate-45 bg-secondary-500" />
          <span className="text-xs font-serif-heading font-semibold tracking-regal text-primary-600 dark:text-primary-300 uppercase">
            FutureUp Academy
          </span>
          <div className="h-px w-6 bg-secondary-400/60" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-serif-heading tracking-elegant text-primary-500 dark:text-white mb-4 leading-[1.1]">
          {t('hero.title')}{' '}
          <span className="text-secondary-500 dark:text-secondary-400">
            {t('hero.titleHighlight')}
          </span>
        </h1>

        {/* Ornamental line under title */}
        <div className="flex items-center justify-center gap-0 mb-8">
          <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-secondary-300 dark:to-secondary-700" />
          <div className="mx-2 flex items-center gap-1">
            <div className="w-1 h-1 rotate-45 bg-secondary-400 dark:bg-secondary-600" />
            <div className="w-1.5 h-1.5 rotate-45 bg-secondary-500" />
            <div className="w-1 h-1 rotate-45 bg-secondary-400 dark:bg-secondary-600" />
          </div>
          <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-secondary-300 dark:to-secondary-700" />
        </div>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/courses">
            <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
              {t('hero.exploreCourses')}
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline" size="xl">
              {t('hero.freeConsultation')}
            </Button>
          </Link>
        </div>

        {/* Stats row with classical styling */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 border-white dark:border-bg-dark',
                    i === 0 && 'bg-primary-500',
                    i === 1 && 'bg-secondary-500',
                    i === 2 && 'bg-primary-400',
                    i === 3 && 'bg-secondary-400'
                  )}
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold font-serif-heading text-gray-900 dark:text-white">500+</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('hero.studentsJoined')}</p>
            </div>
          </div>

          {/* Classical vertical divider with diamond */}
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="w-px h-3 bg-secondary-300/60 dark:bg-secondary-700/60" />
            <div className="w-1 h-1 rotate-45 bg-secondary-400 dark:bg-secondary-600" />
            <div className="w-px h-3 bg-secondary-300/60 dark:bg-secondary-700/60" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 text-secondary-400 fill-secondary-400"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold font-serif-heading text-gray-900 dark:text-white">4.9</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Google Rating</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-light dark:from-bg-dark to-transparent" />

    </section>
  );
}
