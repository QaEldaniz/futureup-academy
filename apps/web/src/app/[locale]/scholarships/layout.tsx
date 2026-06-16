import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMessages } from 'next-intl/server';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const meta = messages.meta as Record<string, string>;

  const baseUrl = 'https://futureup.az';
  const localePath = locale === 'az' ? '' : `/${locale}`;

  return {
    title: meta?.scholarshipsTitle || 'Scholarships — FutureUp Academy',
    description: meta?.scholarshipsDescription,
    alternates: {
      canonical: `${baseUrl}${localePath}/scholarships`,
      languages: {
        az: `${baseUrl}/scholarships`,
        ru: `${baseUrl}/ru/scholarships`,
        en: `${baseUrl}/en/scholarships`,
      },
    },
    openGraph: {
      title: meta?.scholarshipsTitle,
      description: meta?.scholarshipsDescription,
      type: 'website',
    },
  };
}

// TEMP: Scholarships page temporarily disabled by request.
// It redirects to the locale home so /scholarships and /scholarships/apply are not reachable.
// To restore: replace the body below with `return children;`.
export default async function ScholarshipsLayout({ params }: Props) {
  const { locale } = await params;
  redirect(locale === 'az' ? '/' : `/${locale}`);
}
