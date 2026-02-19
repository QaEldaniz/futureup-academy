'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  const t = useTranslations('home');

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-light dark:bg-bg-dark">
      {/* Gradient mesh background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary-500/10 dark:bg-secondary-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-[400px] h-[400px] bg-accent-500/8 dark:bg-accent-500/5 rounded-full blur-3xl" />
      </div>

      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Orb 1 */}
        <div
          className={cn(
            'absolute w-20 h-20 rounded-full',
            'bg-gradient-to-br from-primary-400/20 to-primary-600/20 dark:from-primary-400/10 dark:to-primary-600/10',
            'top-[15%] left-[10%] animate-[float_8s_ease-in-out_infinite]'
          )}
        />
        {/* Orb 2 */}
        <div
          className={cn(
            'absolute w-32 h-32 rounded-full',
            'bg-gradient-to-br from-accent-400/15 to-accent-600/15 dark:from-accent-400/10 dark:to-accent-600/10',
            'top-[20%] right-[15%] animate-[float_10s_ease-in-out_infinite_1s]'
          )}
        />
        {/* Orb 3 */}
        <div
          className={cn(
            'absolute w-16 h-16 rounded-full',
            'bg-gradient-to-br from-secondary-400/20 to-secondary-600/20 dark:from-secondary-400/10 dark:to-secondary-600/10',
            'bottom-[25%] left-[20%] animate-[float_7s_ease-in-out_infinite_2s]'
          )}
        />
        {/* Orb 4 */}
        <div
          className={cn(
            'absolute w-24 h-24 rounded-full',
            'bg-gradient-to-br from-primary-300/15 to-accent-400/15 dark:from-primary-300/10 dark:to-accent-400/10',
            'bottom-[15%] right-[10%] animate-[float_9s_ease-in-out_infinite_3s]'
          )}
        />
        {/* Small decorative dots */}
        <div className="absolute w-3 h-3 rounded-full bg-primary-400/30 top-[40%] left-[5%] animate-[pulse_3s_ease-in-out_infinite]" />
        <div className="absolute w-2 h-2 rounded-full bg-accent-400/30 top-[60%] right-[8%] animate-[pulse_4s_ease-in-out_infinite_1s]" />
        <div className="absolute w-4 h-4 rounded-full bg-secondary-400/20 top-[10%] right-[40%] animate-[pulse_5s_ease-in-out_infinite_2s]" />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(108,60,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(108,60,225,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.05)_1px,transparent_1px)]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/30 mb-8">
          <Sparkles className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
            FutureUp Academy
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-[1.1]">
          {t('hero.title')}{' '}
          <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
            {t('hero.titleHighlight')}
          </span>
        </h1>

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

        {/* Stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    'w-9 h-9 rounded-full border-2 border-white dark:border-bg-dark',
                    i === 0 && 'bg-gradient-to-br from-primary-400 to-primary-600',
                    i === 1 && 'bg-gradient-to-br from-secondary-400 to-secondary-600',
                    i === 2 && 'bg-gradient-to-br from-accent-400 to-accent-600',
                    i === 3 && 'bg-gradient-to-br from-primary-300 to-secondary-500'
                  )}
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">500+</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('hero.studentsJoined')}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px h-10 bg-gray-200 dark:bg-gray-700" />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-4 h-4 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900 dark:text-white">4.9</p>
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
