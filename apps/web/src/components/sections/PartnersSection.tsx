'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { Handshake } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string;
  order: number;
}

// Fallback partners when API is unavailable
const fallbackPartners: Partner[] = [
  { id: '1', name: 'Microsoft', logoUrl: '', order: 1 },
  { id: '2', name: 'Google', logoUrl: '', order: 2 },
  { id: '3', name: 'GitHub', logoUrl: '', order: 3 },
  { id: '4', name: 'AWS', logoUrl: '', order: 4 },
  { id: '5', name: 'CompTIA', logoUrl: '', order: 5 },
  { id: '6', name: 'Autodesk', logoUrl: '', order: 6 },
  { id: '7', name: 'Adobe', logoUrl: '', order: 7 },
  { id: '8', name: 'Meta', logoUrl: '', order: 8 },
];

function PartnerLogo({ partner }: { partner: Partner }) {
  const inner = partner.logoUrl ? (
    <img
      src={partner.logoUrl}
      alt={partner.name}
      className="max-h-10 max-w-[120px] object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 dark:brightness-0 dark:invert dark:opacity-40 dark:group-hover:opacity-80"
      loading="lazy"
    />
  ) : (
    <span className="text-base font-bold text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors tracking-wide">
      {partner.name}
    </span>
  );

  const wrapper = (
    <div
      className={cn(
        'flex items-center justify-center px-8 py-4',
        'min-w-[180px] h-[72px]',
        'bg-white/70 dark:bg-white/[0.03] rounded-2xl',
        'border border-gray-100 dark:border-gray-800/50',
        'hover:border-primary-200/70 dark:hover:border-primary-800/40',
        'hover:bg-white dark:hover:bg-white/[0.06]',
        'hover:shadow-lg hover:shadow-primary-500/5',
        'transition-all duration-300',
        'group'
      )}
    >
      {inner}
    </div>
  );

  if (partner.website) {
    return (
      <a
        href={partner.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0"
      >
        {wrapper}
      </a>
    );
  }

  return <div className="shrink-0">{wrapper}</div>;
}

export function PartnersSection() {
  const t = useTranslations('home');
  const [partners, setPartners] = useState<Partner[]>(fallbackPartners);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Partner[] }>('/partners')
      .then((res) => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setPartners(res.data.sort((a, b) => a.order - b.order));
        }
      })
      .catch(() => {
        // Keep fallback data
      });
  }, []);

  // Double the array for seamless infinite scroll
  const doubled = [...partners, ...partners];

  return (
    <section className="py-16 bg-bg-light dark:bg-bg-dark overflow-hidden border-y border-gray-100 dark:border-gray-800/50">
      {/* Section header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 mb-4">
          <Handshake className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {t('partnersLabel')}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
          {t('partnersTitle')}
        </h2>
      </div>

      {/* Marquee container */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-[marquee_40s_linear_infinite] hover:[animation-play-state:paused]">
          <div className="flex gap-6 shrink-0 pr-6">
            {doubled.map((partner, i) => (
              <PartnerLogo key={`${partner.id}-${i}`} partner={partner} />
            ))}
          </div>
          <div className="flex gap-6 shrink-0 pr-6">
            {doubled.map((partner, i) => (
              <PartnerLogo key={`${partner.id}-dup-${i}`} partner={partner} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
