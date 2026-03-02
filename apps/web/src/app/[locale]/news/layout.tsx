import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const meta = messages.meta as Record<string, string>;

  const baseUrl = 'https://futureupacademy.az';
  const localePath = locale === 'az' ? '' : `/${locale}`;

  return {
    title: meta?.newsTitle || 'News — FutureUp Academy',
    description: meta?.newsDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/news`,
      languages: {
        az: `${baseUrl}/news`,
        ru: `${baseUrl}/ru/news`,
        en: `${baseUrl}/en/news`,
      },
    },
    openGraph: {
      title: meta?.newsTitle,
      description: meta?.newsDescription,
      type: 'website',
    },
  };
}

export default function NewsLayout({ children }: Props) {
  return children;
}
