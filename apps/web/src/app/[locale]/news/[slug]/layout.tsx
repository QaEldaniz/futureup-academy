import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { buildMetadata, localizedUrl, pickLocalized } from '@/lib/seo';
import { getNewsArticle } from '@/lib/server-data';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/StructuredData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getNewsArticle(slug);

  if (!article) {
    const messages = await getMessages({ locale });
    const meta = messages.meta as Record<string, string>;
    return buildMetadata({
      locale,
      path: `/news/${slug}`,
      title: meta?.newsTitle || 'News — FutureUp Academy',
      description: meta?.newsDescription,
    });
  }

  const title = pickLocalized(article as unknown as Record<string, unknown>, 'title', locale);
  const description = pickLocalized(article as unknown as Record<string, unknown>, 'excerpt', locale);
  const published = article.publishedAt || article.createdAt;

  return buildMetadata({
    locale,
    path: `/news/${slug}`,
    title: `${title} — FutureUp Academy`,
    description,
    image: article.image,
    type: 'article',
    publishedTime: published || undefined,
    modifiedTime: article.updatedAt || published || undefined,
  });
}

export default async function NewsDetailLayout({ children, params }: Props) {
  const { locale, slug } = await params;
  const article = await getNewsArticle(slug);
  const messages = await getMessages({ locale });
  const nav = messages.nav as Record<string, string> | undefined;
  const url = localizedUrl(locale, `/news/${slug}`);

  return (
    <>
      {article && (
        <>
          <ArticleJsonLd article={article} locale={locale} url={url} />
          <BreadcrumbJsonLd
            items={[
              { name: nav?.home || 'Home', url: localizedUrl(locale, '') },
              { name: nav?.news || 'News', url: localizedUrl(locale, '/news') },
              { name: pickLocalized(article as unknown as Record<string, unknown>, 'title', locale), url },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
