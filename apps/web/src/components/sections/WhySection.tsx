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
        'group relative p-6 sm:p-8 rounded-lg classical-card',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'transition-all duration-300',
        'hover:-translate-y-0.5',
        'hover:border-secondary-300/50 dark:hover:border-secondary-700/50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center mb-5',
          'bg-gradient-to-br',
          feature.iconGradient,
          'shadow-lg'
        )}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold font-serif-heading text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {t(`why.${feature.titleKey}`)}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
        {t(`why.${feature.descKey}`)}
      </p>

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
            <span className="section-subtitle mb-3 block">— Our Distinction —</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading tracking-elegant text-gray-900 dark:text-white mb-3">
              {t('why.title')}
            </h2>
            {/* Ornamental underline */}
            <div className="flex items-center gap-0 mb-5">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-300 dark:to-secondary-700" />
              <div className="w-1.5 h-1.5 rotate-45 bg-secondary-500 mx-2" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-secondary-300 dark:to-secondary-700" />
            </div>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              {t('why.subtitle')}
            </p>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img
                src="/images/team-discussion.jpg"
                alt="Team collaboration"
                className="w-full h-[280px] object-cover"
              />
            </div>
            <div className="absolute -bottom-3 -left-3 w-20 h-20 rounded-lg bg-gradient-to-br from-accent-500 to-primary-500 opacity-15 blur-xl" />
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
