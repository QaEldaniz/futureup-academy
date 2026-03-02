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
    title: meta?.coursesTitle || 'IT Courses — FutureUp Academy',
    description: meta?.coursesDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/courses`,
      languages: {
        az: `${baseUrl}/courses`,
        ru: `${baseUrl}/ru/courses`,
        en: `${baseUrl}/en/courses`,
      },
    },
    openGraph: {
      title: meta?.coursesTitle,
      description: meta?.coursesDescription,
      type: 'website',
    },
  };
}

export default function CoursesLayout({ children }: Props) {
  return children;
}
