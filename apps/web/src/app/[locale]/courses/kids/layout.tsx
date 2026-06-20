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
    path: '/courses/kids',
    title: meta?.coursesKidsTitle || meta?.coursesTitle || 'IT Courses for Kids (8–16) — FutureUp Academy',
    description: meta?.coursesKidsDescription || meta?.coursesDescription,
  });
}

export default function KidsCoursesLayout({ children }: Props) {
  return children;
}
