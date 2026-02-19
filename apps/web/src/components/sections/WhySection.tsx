'use client';

import { useTranslations } from 'next-intl';
import {
  Award,
  Users,
  MonitorPlay,
  Briefcase,
  CalendarClock,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  iconGradient: string;
}

const features: Feature[] = [
  {
    icon: Award,
    titleKey: 'certificate',
    descKey: 'certificateDesc',
    iconGradient: 'from-primary-500 to-primary-700',
  },
  {
    icon: Users,
    titleKey: 'mentorship',
    descKey: 'mentorshipDesc',
    iconGradient: 'from-secondary-500 to-secondary-700',
  },
  {
    icon: MonitorPlay,
    titleKey: 'practice',
    descKey: 'practiceDesc',
    iconGradient: 'from-accent-500 to-accent-700',
  },
  {
    icon: Briefcase,
    titleKey: 'career',
    descKey: 'careerDesc',
    iconGradient: 'from-green-500 to-emerald-600',
  },
  {
    icon: CalendarClock,
    titleKey: 'flexible',
    descKey: 'flexibleDesc',
    iconGradient: 'from-orange-500 to-amber-600',
  },
  {
    icon: Cpu,
    titleKey: 'modern',
    descKey: 'modernDesc',
    iconGradient: 'from-pink-500 to-rose-600',
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const t = useTranslations('home');
  const Icon = feature.icon;

  return (
    <div
      className={cn(
        'group relative p-6 sm:p-8 rounded-2xl',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary-500/5',
        'hover:-translate-y-0.5',
        // Gradient border on hover via pseudo-element trick using box shadow
        'hover:border-transparent',
        'hover:[box-shadow:0_0_0_1px_var(--color-primary-200),0_20px_60px_-15px_rgba(108,60,225,0.08)]',
        'dark:hover:[box-shadow:0_0_0_1px_var(--color-primary-700),0_20px_60px_-15px_rgba(108,60,225,0.15)]'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center mb-5',
          'bg-gradient-to-br',
          feature.iconGradient,
          'shadow-lg'
        )}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {t(`why.${feature.titleKey}`)}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {t(`why.${feature.descKey}`)}
      </p>

      {/* Decorative gradient corner */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-tr-2xl">
        <div className={cn('absolute -top-12 -right-12 w-24 h-24 rounded-full bg-gradient-to-br', feature.iconGradient, 'opacity-10')} />
      </div>
    </div>
  );
}

export function WhySection() {
  const t = useTranslations('home');

  return (
    <section className="py-20 sm:py-28 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header with image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
              {t('why.title')}
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {t('why.subtitle')}
            </p>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary-500/10">
              <img
                src="/images/team-discussion.jpg"
                alt="Team collaboration"
                className="w-full h-[280px] object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -left-3 w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 opacity-15 blur-xl" />
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.titleKey} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
