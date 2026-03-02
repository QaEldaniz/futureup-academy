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
    title: meta?.contactTitle || 'Contact — FutureUp Academy',
    description: meta?.contactDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/contact`,
      languages: {
        az: `${baseUrl}/contact`,
        ru: `${baseUrl}/ru/contact`,
        en: `${baseUrl}/en/contact`,
      },
    },
    openGraph: {
      title: meta?.contactTitle,
      description: meta?.contactDescription,
      type: 'website',
    },
  };
}

export default function ContactLayout({ children }: Props) {
  return children;
}
