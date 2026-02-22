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

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white/10 border border-white/10 mb-8">
          <Sparkles className="w-4 h-4 text-accent-300" />
          <span className="text-sm font-medium text-white/80">
            FutureUp Academy
          </span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-white mb-6 leading-tight">
          {t('cta.title')}
        </h2>

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
