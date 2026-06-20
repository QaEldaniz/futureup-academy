import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo';
import { FaqJsonLd } from '@/components/seo/StructuredData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const meta = messages.meta as Record<string, string>;
  return buildMetadata({
    locale,
    path: '/faq',
    title: meta?.faqTitle || 'FAQ — FutureUp Academy',
    description: meta?.faqDescription,
  });
}

export default async function FaqLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const faq = messages.faq as Record<string, string>;
  const items = Array.from({ length: 22 }, (_, i) => ({
    question: faq?.[`q${i + 1}`],
    answer: faq?.[`a${i + 1}`],
  })).filter((x) => x.question && x.answer) as { question: string; answer: string }[];

  return (
    <>
      {items.length > 0 && <FaqJsonLd items={items} />}
      {children}
    </>
  );
}
