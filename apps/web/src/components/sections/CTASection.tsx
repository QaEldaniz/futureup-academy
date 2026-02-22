'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CTASection() {
  const t = useTranslations('home');

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700" />

      {/* Mesh overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary-500 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Classical badge */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-md bg-white/10 border border-white/10 mb-8">
          <div className="h-px w-4 bg-secondary-400/60" />
          <span className="text-xs font-serif-heading font-semibold tracking-regal text-secondary-300 uppercase">
            FutureUp Academy
          </span>
          <div className="h-px w-4 bg-secondary-400/60" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading tracking-elegant text-white mb-4 leading-tight">
          {t('cta.title')}
        </h2>

        {/* Ornamental line */}
        <div className="flex items-center justify-center gap-0 mb-8">
          <div className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-secondary-400/60" />
          <div className="mx-2 flex items-center gap-1">
            <div className="w-1 h-1 rotate-45 bg-secondary-400/60" />
            <div className="w-1.5 h-1.5 rotate-45 bg-secondary-400" />
            <div className="w-1 h-1 rotate-45 bg-secondary-400/60" />
          </div>
          <div className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-secondary-400/60" />
        </div>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('cta.subtitle')}
        </p>

        {/* CTA Button */}
        <Link href="/contact">
          <button
            className={cn(
              'inline-flex items-center justify-center gap-3',
              'px-10 py-4 text-lg font-semibold',
              'bg-white text-primary-700',
              'rounded-lg',
              'shadow-lg',
              'hover:bg-accent-50 hover:shadow-lg',
              'hover:-translate-y-0.5',
              'active:scale-[0.98]',
              'transition-all duration-200'
            )}
          >
            {t('cta.button')}
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>

    </section>
  );
}
