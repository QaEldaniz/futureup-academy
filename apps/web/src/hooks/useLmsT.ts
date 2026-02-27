'use client';

import { useState, useEffect, useCallback } from 'react';
import translations, { type LmsLocale } from '@/lib/lms-translations';

const LMS_LOCALE_KEY = 'futureup-lms-locale';

/**
 * Hook for LMS translations.
 * Returns: { t, locale, setLocale }
 *   t('key') → translated string
 *   t('key', { name: 'John' }) → replaces {name} with 'John'
 */
export function useLmsT() {
  const [locale, setLocaleState] = useState<LmsLocale>('az');

  useEffect(() => {
    const stored = localStorage.getItem(LMS_LOCALE_KEY) as LmsLocale | null;
    if (stored && ['az', 'ru', 'en'].includes(stored)) {
      setLocaleState(stored);
    }

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as LmsLocale;
      if (detail && ['az', 'ru', 'en'].includes(detail)) {
        setLocaleState(detail);
      }
    };
    window.addEventListener('lms-locale-change', handler);
    return () => window.removeEventListener('lms-locale-change', handler);
  }, []);

  const setLocale = useCallback((l: LmsLocale) => {
    setLocaleState(l);
    localStorage.setItem(LMS_LOCALE_KEY, l);
    window.dispatchEvent(new CustomEvent('lms-locale-change', { detail: l }));
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const entry = translations[key];
      if (!entry) return key;
      let text = entry[locale] || entry['en'] || key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return text;
    },
    [locale]
  );

  /** Helper: pick localized field from DB object (titleAz/titleRu/titleEn) */
  const tField = useCallback(
    (item: Record<string, any> | null | undefined, field: string): string => {
      if (!item) return '—';
      if (locale === 'ru') return item[`${field}Ru`] || item[`${field}En`] || item[`${field}Az`] || '—';
      if (locale === 'en') return item[`${field}En`] || item[`${field}Az`] || item[`${field}Ru`] || '—';
      return item[`${field}Az`] || item[`${field}En`] || item[`${field}Ru`] || '—';
    },
    [locale]
  );

  return { t, tField, locale, setLocale };
}
