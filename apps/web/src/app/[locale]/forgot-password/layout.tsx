import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/forgot-password', title: 'Reset Password — FutureUp Academy', noindex: true });
}

export default function ForgotPasswordLayout({ children }: Props) {
  return children;
}
