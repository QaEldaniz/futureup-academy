export const locales = ['az', 'ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'az';

export const localeNames: Record<Locale, string> = {
  az: 'Azərbaycan',
  ru: 'Русский',
  en: 'English',
};

export const localeFlags: Record<Locale, string> = {
  az: '🇦🇿',
  ru: '🇷🇺',
  en: '🇬🇧',
};
