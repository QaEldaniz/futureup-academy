'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Users, BookOpen, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  labelKey: string;
}

const stats: StatItem[] = [
  { icon: Users, value: 500, suffix: '+', labelKey: 'students' },
  { icon: BookOpen, value: 50, suffix: '+', labelKey: 'courses' },
  { icon: TrendingUp, value: 95, suffix: '%', labelKey: 'employment' },
  { icon: Award, value: 30, suffix: '+', labelKey: 'teachers' },
];

function useCountUp(target: number, isVisible: boolean, duration: number = 2000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, isVisible, duration]);

  return count;
}

function StatCard({ item, isVisible, index }: { item: StatItem; isVisible: boolean; index: number }) {
  const t = useTranslations('home');
  const count = useCountUp(item.value, isVisible);
  const Icon = item.icon;

  return (
    <div
      className={cn(
        'relative group flex flex-col items-center text-center p-8 rounded-lg',
        'bg-white dark:bg-surface-dark',
        'border border-gray-100 dark:border-gray-800',
        'hover:border-primary-200 dark:hover:border-primary-700/50',
        'shadow-sm hover:shadow-lg',
        'transition-all duration-500',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      )}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Icon */}
      <div className={cn(
        'w-14 h-14 rounded-lg flex items-center justify-center mb-5',
        'bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30',
        'group-hover:from-primary-200 group-hover:to-secondary-200 dark:group-hover:from-primary-800/40 dark:group-hover:to-secondary-800/40',
        'transition-colors duration-300'
      )}>
        <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
      </div>

      {/* Number */}
      <div className="text-4xl sm:text-5xl font-bold font-serif-heading mb-2 text-primary-500 dark:text-primary-400">
        {count}{item.suffix}
      </div>

      {/* Label */}
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {t(`stats.${item.labelKey}`)}
      </p>

      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-lg pointer-events-none">
        <div className="absolute top-0 right-0 w-24 h-24 -translate-y-12 translate-x-12 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-full group-hover:from-primary-500/10 group-hover:to-accent-500/10 transition-colors" />
      </div>
    </div>
  );
}

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0]?.isIntersecting) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2,
    });

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [handleIntersection]);

  return (
    <section className="py-20 sm:py-28 bg-bg-light dark:bg-bg-dark" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, index) => (
            <StatCard
              key={item.labelKey}
              item={item}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
