'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Globe } from 'lucide-react';

type LmsLocale = 'az' | 'ru' | 'en';

const localeConfig: Record<LmsLocale, { flag: string; name: string }> = {
  az: { flag: '🇦🇿', name: 'AZ' },
  ru: { flag: '🇷🇺', name: 'RU' },
  en: { flag: '🇬🇧', name: 'EN' },
};

const LMS_LOCALE_KEY = 'futureup-lms-locale';

export function useLmsLocale(): [LmsLocale, (l: LmsLocale) => void] {
  const [locale, setLocaleState] = useState<LmsLocale>('az');

  useEffect(() => {
    const stored = localStorage.getItem(LMS_LOCALE_KEY) as LmsLocale | null;
    if (stored && localeConfig[stored]) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((l: LmsLocale) => {
    setLocaleState(l);
    localStorage.setItem(LMS_LOCALE_KEY, l);
    // Dispatch event so other components can react
    window.dispatchEvent(new CustomEvent('lms-locale-change', { detail: l }));
  }, []);

  return [locale, setLocale];
}

export function LmsLanguageSwitcher() {
  const [locale, setLocale] = useLmsLocale();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium text-gray-600 dark:text-gray-400"
      >
        <Globe className="w-4 h-4" />
        <span>{localeConfig[locale].flag}</span>
        <span className="hidden sm:inline text-xs">{localeConfig[locale].name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[120px]">
          {(Object.keys(localeConfig) as LmsLocale[]).map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setIsOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                l === locale
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span>{localeConfig[l].flag}</span>
              <span>{localeConfig[l].name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
