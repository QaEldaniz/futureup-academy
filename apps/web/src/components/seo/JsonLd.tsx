'use client';

import { useLocale } from 'next-intl';

export function OrganizationJsonLd() {
  const locale = useLocale();

  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'FutureUp Academy',
    alternateName: [
      'FutureUp AI Academy',
      'FutureUp IT Academy',
      'FutureUp Akademiya',
    ],
    url: 'https://futureupacademy.az',
    logo: 'https://futureupacademy.az/images/logo.png',
    description:
      locale === 'az'
        ? 'Bakıda ən yaxşı IT kursları — proqramlaşdırma, veb dizayn, data analitika, süni intellekt, kibertəhlükəsizlik. Uşaqlar və böyüklər üçün IT təhsil.'
        : locale === 'ru'
          ? 'Лучшие IT курсы в Баку — программирование, веб-дизайн, аналитика данных, искусственный интеллект, кибербезопасность. IT курсы для детей и взрослых.'
          : 'Best IT courses in Baku — programming, web design, data analytics, artificial intelligence, cybersecurity. IT courses for kids and adults.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Baku',
      addressCountry: 'AZ',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Azerbaijan',
    },
    sameAs: [
      'https://www.instagram.com/futureupacademy',
      'https://www.facebook.com/futureupacademy',
      'https://www.linkedin.com/company/futureupacademy',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name:
        locale === 'az'
          ? 'IT Kurslar'
          : locale === 'ru'
            ? 'IT Курсы'
            : 'IT Courses',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name:
            locale === 'az'
              ? 'Böyüklər üçün IT kursları'
              : locale === 'ru'
                ? 'IT курсы для взрослых'
                : 'IT Courses for Adults',
          itemListElement: [
            'Programming', 'Web Design', 'Data Analytics',
            'Cybersecurity', 'AI & Machine Learning', 'Digital Marketing',
          ].map((name) => ({
            '@type': 'Course',
            name,
            provider: { '@type': 'Organization', name: 'FutureUp Academy' },
          })),
        },
        {
          '@type': 'OfferCatalog',
          name:
            locale === 'az'
              ? 'Uşaqlar üçün IT kursları'
              : locale === 'ru'
                ? 'IT курсы для детей'
                : 'IT Courses for Kids',
          itemListElement: [
            'Kids Coding', 'Kids AI', 'Kids Cybersecurity',
          ].map((name) => ({
            '@type': 'Course',
            name,
            provider: { '@type': 'Organization', name: 'FutureUp Academy' },
          })),
        },
      ],
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://futureupacademy.az',
    name: 'FutureUp Academy',
    image: 'https://futureupacademy.az/images/logo.png',
    url: 'https://futureupacademy.az',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Baku',
      addressRegion: 'Baku',
      addressCountry: 'AZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.4093,
      longitude: 49.8671,
    },
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FutureUp Academy',
    url: 'https://futureupacademy.az',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://futureupacademy.az/courses?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['az', 'ru', 'en'],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
