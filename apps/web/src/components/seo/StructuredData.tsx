import { SITE_URL, SITE_NAME, pickLocalized } from '@/lib/seo';
import type { SeoCourse, SeoNews, SeoReview } from '@/lib/server-data';

/** Generic JSON-LD script tag (server component). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const absUrl = (src?: string | null) =>
  !src ? undefined : src.startsWith('http') ? src : `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;

/** "3 ay" → "P3M", "6 həftə" → "P6W", "40 saat" → "PT40H". */
function durationToISO(duration?: string): string | undefined {
  if (!duration) return undefined;
  const m = duration.match(/(\d+)/);
  if (!m) return undefined;
  const n = m[1];
  const d = duration.toLowerCase();
  if (/(ay|month|месяц|мес)/.test(d)) return `P${n}M`;
  if (/(həftə|hefte|week|недел)/.test(d)) return `P${n}W`;
  if (/(saat|hour|час)/.test(d)) return `PT${n}H`;
  if (/(gün|gun|day|дн|ден)/.test(d)) return `P${n}D`;
  return undefined;
}

function priceNumber(price?: string): string | undefined {
  if (!price) return undefined;
  const m = price.replace(/\s/g, '').match(/(\d[\d.]*)/);
  return m ? m[1] : undefined;
}

export function CourseJsonLd({
  course,
  locale,
  url,
  reviews = [],
}: {
  course: SeoCourse;
  locale: string;
  url: string;
  reviews?: SeoReview[];
}) {
  const name = pickLocalized(course as unknown as Record<string, unknown>, 'title', locale);
  const description =
    pickLocalized(course as unknown as Record<string, unknown>, 'shortDesc', locale) ||
    pickLocalized(course as unknown as Record<string, unknown>, 'desc', locale);
  const workload = durationToISO(course.duration);
  const price = priceNumber(course.price);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    inLanguage: locale,
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: SITE_URL,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Onsite',
      ...(workload ? { courseWorkload: workload } : {}),
      location: {
        '@type': 'Place',
        name: SITE_NAME,
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Baku',
          addressCountry: 'AZ',
        },
      },
    },
  };

  if (course.category) {
    data.about = pickLocalized(course.category as unknown as Record<string, unknown>, 'name', locale);
  }
  if (price) {
    data.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: 'AZN',
      category: 'Paid',
      availability: 'https://schema.org/InStock',
      url,
    };
  }

  // Star rich results — only with REAL approved reviews (never fabricated).
  if (reviews.length > 0) {
    const sum = reviews.reduce((s, r) => s + (r.rating || 0), 0);
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round((sum / reviews.length) * 10) / 10,
      reviewCount: reviews.length,
      bestRating: 5,
      worstRating: 1,
    };
    data.review = reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      author: { '@type': 'Person', name: 'FutureUp student' },
      ...(r.text ? { reviewBody: r.text } : {}),
    }));
  }

  return <JsonLd data={data} />;
}

export function ArticleJsonLd({
  article,
  locale,
  url,
}: {
  article: SeoNews;
  locale: string;
  url: string;
}) {
  const headline = pickLocalized(article as unknown as Record<string, unknown>, 'title', locale);
  const description = pickLocalized(article as unknown as Record<string, unknown>, 'excerpt', locale);
  const published = article.publishedAt || article.createdAt;
  const image = absUrl(article.image) || `${SITE_URL}/og-image.jpg`;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    image: [image],
    inLanguage: locale,
    datePublished: published,
    dateModified: article.updatedAt || published,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/images/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return <JsonLd data={data} />;
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
  return <JsonLd data={data} />;
}

export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.question,
      acceptedAnswer: { '@type': 'Answer', text: it.answer },
    })),
  };
  return <JsonLd data={data} />;
}
