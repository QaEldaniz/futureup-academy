'use client';

import { cn } from '@/lib/utils';

const partners = [
  'Microsoft',
  'Google',
  'GitHub',
  'AWS',
  'CompTIA',
  'Autodesk',
  'Adobe',
  'Meta',
];

function PartnerLogo({ name }: { name: string }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center px-8 py-4',
        'min-w-[160px] h-16',
        'bg-white/60 dark:bg-white/5 rounded-xl',
        'border border-gray-100 dark:border-gray-800/50',
        'hover:border-primary-200 dark:hover:border-primary-800/50',
        'transition-all duration-300',
        'group cursor-default'
      )}
    >
      <span className="text-lg font-bold text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors tracking-wide">
        {name}
      </span>
    </div>
  );
}

export function PartnersSection() {
  // Double the array for seamless infinite scroll
  const doubled = [...partners, ...partners];

  return (
    <section className="py-12 bg-bg-light dark:bg-bg-dark overflow-hidden border-y border-gray-100 dark:border-gray-800/50">
      {/* Marquee container */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-bg-light dark:from-bg-dark to-transparent z-10 pointer-events-none" />

        {/* Scrolling track */}
        <div className="flex animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
          <div className="flex gap-6 shrink-0 pr-6">
            {doubled.map((partner, i) => (
              <PartnerLogo key={`${partner}-${i}`} name={partner} />
            ))}
          </div>
          <div className="flex gap-6 shrink-0 pr-6">
            {doubled.map((partner, i) => (
              <PartnerLogo key={`${partner}-dup-${i}`} name={partner} />
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
