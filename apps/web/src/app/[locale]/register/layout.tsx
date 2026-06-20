import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/register', title: 'Register — FutureUp Academy', noindex: true });
}

export default function RegisterLayout({ children }: Props) {
  return children;
}
