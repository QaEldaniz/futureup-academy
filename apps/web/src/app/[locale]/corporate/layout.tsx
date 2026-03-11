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
    title: meta?.corporateTitle || 'Corporate Training — FutureUp Academy',
    description: meta?.corporateDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/corporate`,
      languages: {
        az: `${baseUrl}/corporate`,
        ru: `${baseUrl}/ru/corporate`,
        en: `${baseUrl}/en/corporate`,
      },
    },
    openGraph: {
      title: meta?.corporateTitle,
      description: meta?.corporateDescription,
      type: 'website',
    },
  };
}

export default function CorporateLayout({ children }: Props) {
  return children;
}
