'use client';

import { useTranslations } from 'next-intl';
import { ClipboardList, BookOpen, Code2, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  icon: React.ElementType;
  number: number;
  titleKey: string;
  descKey: string;
}

const steps: Step[] = [
  { icon: ClipboardList, number: 1, titleKey: 'step1', descKey: 'step1Desc' },
  { icon: BookOpen, number: 2, titleKey: 'step2', descKey: 'step2Desc' },
  { icon: Code2, number: 3, titleKey: 'step3', descKey: 'step3Desc' },
  { icon: Briefcase, number: 4, titleKey: 'step4', descKey: 'step4Desc' },
];

export function ProcessSection() {
  const t = useTranslations('home');

  return (
    <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-gray-900/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading text-gray-900 dark:text-white mb-4">
            {t('process.title')}
          </h2>
          <p className="max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {t('process.subtitle')}
          </p>
        </div>

        {/* Timeline - horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Desktop horizontal layout */}
          <div className="hidden lg:block">
            {/* Connecting line */}
            <div className="absolute top-[52px] left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 opacity-20" />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="flex flex-col items-center text-center group">
                    {/* Number circle + icon */}
                    <div className="relative mb-8">
                      {/* Outer glow ring */}
                      <div className="absolute inset-0 w-[104px] h-[104px] -translate-x-[calc(50%-52px)] -translate-y-0 rounded-full bg-gradient-to-br from-primary-500/10 to-secondary-500/10 group-hover:from-primary-500/20 group-hover:to-secondary-500/20 transition-colors duration-300" />
                      {/* Main circle */}
                      <div
                        className={cn(
                          'relative z-10 w-[104px] h-[104px] rounded-full flex flex-col items-center justify-center',
                          'bg-white dark:bg-surface-dark',
                          'border-2 border-gray-100 dark:border-gray-800',
                          'group-hover:border-primary-300 dark:group-hover:border-primary-700',
                          'shadow-lg group-hover:shadow-lg',
                          'transition-all duration-300'
                        )}
                      >
                        {/* Step number */}
                        <span className="text-xs font-bold text-primary-500 mb-1">
                          {String(step.number).padStart(2, '0')}
                        </span>
                        <Icon className="w-7 h-7 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {t(`process.${step.titleKey}`)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px]">
                      {t(`process.${step.descKey}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile vertical layout */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 via-secondary-500 to-accent-500 opacity-20" />

              <div className="flex flex-col gap-10">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="flex gap-6 group">
                      {/* Circle */}
                      <div className="shrink-0">
                        <div
                          className={cn(
                            'relative z-10 w-14 h-14 rounded-full flex flex-col items-center justify-center',
                            'bg-white dark:bg-surface-dark',
                            'border-2 border-gray-100 dark:border-gray-800',
                            'group-hover:border-primary-300 dark:group-hover:border-primary-700',
                            'shadow-md group-hover:shadow-lg',
                            'transition-all duration-300'
                          )}
                        >
                          <span className="text-[10px] font-bold text-primary-500 -mb-0.5">
                            {String(step.number).padStart(2, '0')}
                          </span>
                          <Icon className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pt-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                          {t(`process.${step.titleKey}`)}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                          {t(`process.${step.descKey}`)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
