import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { buildMetadata } from '@/lib/seo';

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
    path: '/about',
    title: meta?.aboutTitle || 'About Us — FutureUp Academy',
    description: meta?.aboutDescription,
  });
}

export default function AboutLayout({ children }: Props) {
  return children;
}
