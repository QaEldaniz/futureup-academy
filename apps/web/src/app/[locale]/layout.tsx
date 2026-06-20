import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { CourseAdvisor } from '@/components/shared/CourseAdvisor';
import { locales } from '@/i18n/config';
import { OrganizationJsonLd, LocalBusinessJsonLd, WebSiteJsonLd } from '@/components/seo/JsonLd';
import { HtmlLangSync } from '@/components/seo/HtmlLangSync';
import { buildMetadata } from '@/lib/seo';
import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale });
  const meta = messages.meta as Record<string, string>;

  return {
    ...buildMetadata({
      locale,
      path: '',
      title: meta?.title || 'FutureUp Academy — IT Courses in Baku',
      description: meta?.description || "Azerbaijan's #1 IT Academy",
      keywords: meta?.keywords,
    }),
    other: {
      'geo.region': 'AZ',
      'geo.placename': 'Baku',
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <HtmlLangSync locale={locale} />
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebSiteJsonLd />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <CourseAdvisor />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
