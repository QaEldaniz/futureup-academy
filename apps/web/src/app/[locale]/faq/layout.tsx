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
    title: meta?.faqTitle || 'FAQ — FutureUp Academy',
    description: meta?.faqDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/faq`,
      languages: {
        az: `${baseUrl}/faq`,
        ru: `${baseUrl}/ru/faq`,
        en: `${baseUrl}/en/faq`,
      },
    },
    openGraph: {
      title: meta?.faqTitle,
      description: meta?.faqDescription,
      type: 'website',
    },
  };
}

export default function FaqLayout({ children }: Props) {
  return children;
}
