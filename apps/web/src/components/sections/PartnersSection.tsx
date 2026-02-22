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

/* ------------------------------------------------------------------ */
/* Inline SVG logos for fallback partners                               */
/* ------------------------------------------------------------------ */

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" fill="none">
      <rect width="11" height="11" fill="#F25022" />
      <rect x="12" width="11" height="11" fill="#7FBA00" />
      <rect y="12" width="11" height="11" fill="#00A4EF" />
      <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
    </svg>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function AWSLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 48" fill="none">
      <path d="M22.8 28.9c-5.5 4.1-13.5 6.2-20.4 6.2-9.6 0-18.3-3.6-24.9-9.5-.5-.5-.1-1.1.6-.8 7.1 4.1 15.8 6.6 24.9 6.6 6.1 0 12.8-1.3 19-3.9.9-.4 1.7.6.8 1.4z" transform="translate(24 4)" fill="#FF9900" />
      <path d="M25.2 26.1c-.7-.9-4.7-.4-6.5-.2-.5.1-.6-.4-.1-.8 3.2-2.2 8.4-1.6 9-0.8.6.8-.2 6.1-3.1 8.7-.5.4-.9.2-.7-.3.7-1.7 2.2-5.7 1.4-6.6z" transform="translate(24 4)" fill="#FF9900" />
      <text x="8" y="28" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="18" fill="#252F3E">AWS</text>
    </svg>
  );
}

function CompTIALogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 32" fill="none">
      <text x="0" y="24" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="20" fill="#C8202F">Comp</text>
      <text x="56" y="24" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="20" fill="#6B6B6B">TIA</text>
    </svg>
  );
}

function CiscoLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 40" fill="none">
      <g fill="#049fd9">
        <rect x="22" y="6" width="3" height="14" rx="1.5" />
        <rect x="28" y="2" width="3" height="18" rx="1.5" />
        <rect x="34" y="8" width="3" height="12" rx="1.5" />
        <rect x="58" y="6" width="3" height="14" rx="1.5" />
        <rect x="64" y="2" width="3" height="18" rx="1.5" />
        <rect x="70" y="8" width="3" height="12" rx="1.5" />
        <rect x="94" y="6" width="3" height="14" rx="1.5" />
        <rect x="100" y="2" width="3" height="18" rx="1.5" />
        <rect x="106" y="8" width="3" height="12" rx="1.5" />
      </g>
      <text x="12" y="36" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="14" letterSpacing="6" fill="#049fd9">cisco</text>
    </svg>
  );
}

function AdobeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 26" fill="#FF0000">
      <polygon points="11.5,0 0,26 8.5,26 11,20 17.4,20" />
      <polygon points="18.5,0 30,26 21.5,26 19,20 12.6,20" />
      <polygon points="15,9 19.5,20 10.5,20" />
    </svg>
  );
}

function MetaLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 20" fill="none">
      <path d="M6.09 2C4.49 2 3.1 3.12 1.93 5.06.7 7.1 0 9.78 0 11.8c0 1.56.37 2.83 1.07 3.65.64.75 1.53 1.16 2.6 1.16 1.44 0 2.72-.77 4.06-2.67.42-.6 1.33-2.13 2.17-3.67l1.24-2.27c1.26-2.3 2.72-4.35 4.57-5.73C17.04 3.23 18.6 2.6 20.28 2.6c2.53 0 4.69 1.12 6.1 3.24 1.53 2.3 2.32 5.43 2.32 8.96 0 2.18-.41 3.97-1.16 5.24-.7 1.18-1.74 1.96-3.06 1.96v-3.5c1.26 0 1.82-1.63 1.82-3.7 0-2.81-.55-5.37-1.63-7.13-.87-1.42-2.06-2.22-3.39-2.22-1.52 0-2.92 1.06-4.24 3.14-.72 1.14-1.43 2.52-2.26 4.12l-.94 1.82c-1.82 3.52-2.72 4.96-3.77 6.14C8.51 22.18 7.09 23 5.43 23 3.7 23 2.27 22.33 1.28 21.1.41 20.01 0 18.52 0 16.76 0 13.74.88 10.53 2.4 8 3.83 5.63 5.83 4 8.09 4l-2-.02z" fill="url(#meta_g)" />
      <defs>
        <linearGradient id="meta_g" x1="0" y1="12" x2="28.7" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0278F8" />
          <stop offset="0.5" stopColor="#9830EF" />
          <stop offset="1" stopColor="#F02849" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* Map fallback name → SVG component */
const logoComponents: Record<string, React.FC<{ className?: string }>> = {
  Microsoft: MicrosoftLogo,
  Google: GoogleLogo,
  GitHub: GitHubLogo,
  AWS: AWSLogo,
  CompTIA: CompTIALogo,
  Cisco: CiscoLogo,
  Adobe: AdobeLogo,
  Meta: MetaLogo,
};

// Fallback partners when API is unavailable
const fallbackPartners: Partner[] = [
  { id: '1', name: 'Microsoft', logoUrl: '', order: 1 },
  { id: '2', name: 'Google', logoUrl: '', order: 2 },
  { id: '3', name: 'GitHub', logoUrl: '', order: 3 },
  { id: '4', name: 'AWS', logoUrl: '', order: 4 },
  { id: '5', name: 'CompTIA', logoUrl: '', order: 5 },
  { id: '6', name: 'Cisco', logoUrl: '', order: 6 },
  { id: '7', name: 'Adobe', logoUrl: '', order: 7 },
  { id: '8', name: 'Meta', logoUrl: '', order: 8 },
];

function PartnerLogo({ partner }: { partner: Partner }) {
  const SvgLogo = logoComponents[partner.name];
  const [imgError, setImgError] = useState(false);

  // Use SVG logo if: no URL, URL failed to load, or we have a matching SVG
  const useImg = partner.logoUrl && !imgError && !SvgLogo;

  const inner = useImg ? (
    <img
      src={partner.logoUrl}
      alt={partner.name}
      onError={() => setImgError(true)}
      className="max-h-10 max-w-[120px] object-contain opacity-60 group-hover:opacity-100 transition-all duration-300 dark:brightness-0 dark:invert dark:opacity-40 dark:group-hover:opacity-80"
      loading="lazy"
    />
  ) : SvgLogo ? (
    <div className="flex items-center gap-2.5 opacity-60 group-hover:opacity-100 transition-all duration-300">
      <SvgLogo className="h-8 w-auto" />
      {!['Microsoft', 'Google', 'Adobe', 'Meta'].includes(partner.name) && (
        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 tracking-wide">
          {partner.name}
        </span>
      )}
    </div>
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
        'bg-white/70 dark:bg-white/[0.03] rounded-lg',
        'border border-gray-100 dark:border-gray-800/50',
        'hover:border-primary-200/70 dark:hover:border-primary-800/40',
        'hover:bg-white dark:hover:bg-white/[0.06]',
        'hover:shadow-lg',
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 mb-4">
          <Handshake className="w-3.5 h-3.5 text-primary-500" />
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
            {t('partnersLabel')}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold font-serif-heading text-gray-900 dark:text-white">
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
