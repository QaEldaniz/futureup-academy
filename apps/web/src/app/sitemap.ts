import type { MetadataRoute } from 'next';

const BASE_URL = 'https://futureupacademy.az';

const locales = ['az', 'ru', 'en'] as const;
const defaultLocale = 'az';

const pages = [
  '',
  '/about',
  '/courses',
  '/contact',
  '/faq',
  '/news',
  '/scholarships',
  '/corporate',
  '/teachers',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    const alternates: Record<string, string> = {};
    for (const locale of locales) {
      const prefix = locale === defaultLocale ? '' : `/${locale}`;
      alternates[locale] = `${BASE_URL}${prefix}${page}`;
    }

    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: page === '' ? 'weekly' : 'monthly',
      priority: page === '' ? 1.0 : page === '/courses' ? 0.9 : 0.7,
      alternates: {
        languages: alternates,
      },
    });
  }

  return entries;
}
