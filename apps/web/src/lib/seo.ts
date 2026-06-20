import type { Metadata } from 'next';

export const SITE_URL = 'https://futureup.az';
export const SITE_NAME = 'FutureUp Academy';
export const OG_IMAGE = '/og-image.jpg';
export const DEFAULT_LOCALE = 'az';
export const LOCALES = ['az', 'ru', 'en'] as const;
export type SeoLocale = (typeof LOCALES)[number];

const OG_LOCALE: Record<string, string> = { az: 'az_AZ', ru: 'ru_RU', en: 'en_US' };

/** URL path prefix for a locale ("" for the default az, "/ru", "/en"). */
export const localePrefix = (locale: string) => (locale === DEFAULT_LOCALE ? '' : `/${locale}`);

/** Absolute canonical URL for a given locale + path. */
export const localizedUrl = (locale: string, path = '') => `${SITE_URL}${localePrefix(locale)}${path}`;

/** hreflang map (all locales + x-default) for a path, for `alternates.languages`. */
export function hreflangLanguages(path = ''): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${SITE_URL}${localePrefix(l)}${path}`;
  languages['x-default'] = `${SITE_URL}${path}`;
  return languages;
}

export interface BuildMetaArgs {
  locale: string;
  /** Path WITHOUT the locale prefix, e.g. "/courses" or "/news/my-article". */
  path?: string;
  title: string;
  description?: string;
  keywords?: string;
  /** Absolute or root-relative OG image; defaults to the branded site image. */
  image?: string;
  type?: 'website' | 'article';
  /** Set true for utility pages (login/register) to keep them out of the index. */
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Single source of truth for page metadata. Guarantees every page gets a
 * resolvable metadataBase, canonical, full hreflang set (incl. x-default),
 * and complete Open Graph + Twitter cards with the branded preview image.
 */
export function buildMetadata({
  locale,
  path = '',
  title,
  description,
  keywords,
  image,
  type = 'website',
  noindex = false,
  publishedTime,
  modifiedTime,
}: BuildMetaArgs): Metadata {
  const url = localizedUrl(locale, path);
  const img = image || OG_IMAGE;
  const ogLocale = OG_LOCALE[locale] || 'az_AZ';
  const images = [{ url: img, width: 1200, height: 630, alt: title }];

  const openGraph: NonNullable<Metadata['openGraph']> =
    type === 'article'
      ? { title, description, url, siteName: SITE_NAME, type: 'article', locale: ogLocale, images, publishedTime, modifiedTime }
      : { title, description, url, siteName: SITE_NAME, type: 'website', locale: ogLocale, images };

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: {
      canonical: url,
      languages: hreflangLanguages(path),
    },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [img],
    },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
  };
}

/** Pick the localized variant of a record field, falling back to EN then AZ. */
export function pickLocalized(
  item: Record<string, unknown> | null | undefined,
  field: string,
  locale: string,
): string {
  if (!item) return '';
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (
    (item[`${field}${suffix}`] as string) ||
    (item[`${field}En`] as string) ||
    (item[`${field}Az`] as string) ||
    ''
  );
}
