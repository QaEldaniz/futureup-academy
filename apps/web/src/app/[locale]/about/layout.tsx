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
    title: meta?.aboutTitle || 'About Us — FutureUp Academy',
    description: meta?.aboutDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/about`,
      languages: {
        az: `${baseUrl}/about`,
        ru: `${baseUrl}/ru/about`,
        en: `${baseUrl}/en/about`,
      },
    },
    openGraph: {
      title: meta?.aboutTitle,
      description: meta?.aboutDescription,
      type: 'website',
    },
  };
}

export default function AboutLayout({ children }: Props) {
  return children;
}
