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
    title: meta?.teachersTitle || 'Our Instructors — FutureUp Academy',
    description: meta?.teachersDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/teachers`,
      languages: {
        az: `${baseUrl}/teachers`,
        ru: `${baseUrl}/ru/teachers`,
        en: `${baseUrl}/en/teachers`,
      },
    },
    openGraph: {
      title: meta?.teachersTitle,
      description: meta?.teachersDescription,
      type: 'website',
    },
  };
}

export default function TeachersLayout({ children }: Props) {
  return children;
}
