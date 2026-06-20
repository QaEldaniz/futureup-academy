import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { buildMetadata, localizedUrl, pickLocalized } from '@/lib/seo';
import { getCourse, getCourseReviews } from '@/lib/server-data';
import { CourseJsonLd, BreadcrumbJsonLd } from '@/components/seo/StructuredData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    const messages = await getMessages({ locale });
    const meta = messages.meta as Record<string, string>;
    return buildMetadata({
      locale,
      path: `/courses/${slug}`,
      title: meta?.coursesTitle || 'IT Courses — FutureUp Academy',
      description: meta?.coursesDescription,
    });
  }

  const title = pickLocalized(course as unknown as Record<string, unknown>, 'title', locale);
  const description =
    pickLocalized(course as unknown as Record<string, unknown>, 'shortDesc', locale) ||
    pickLocalized(course as unknown as Record<string, unknown>, 'desc', locale);

  return buildMetadata({
    locale,
    path: `/courses/${slug}`,
    title: `${title} — FutureUp Academy`,
    description,
  });
}

export default async function CourseDetailLayout({ children, params }: Props) {
  const { locale, slug } = await params;
  const course = await getCourse(slug);
  const reviews = course?.id ? (await getCourseReviews(course.id)) || [] : [];
  const messages = await getMessages({ locale });
  const nav = messages.nav as Record<string, string> | undefined;
  const url = localizedUrl(locale, `/courses/${slug}`);

  return (
    <>
      {course && (
        <>
          <CourseJsonLd course={course} locale={locale} url={url} reviews={reviews} />
          <BreadcrumbJsonLd
            items={[
              { name: nav?.home || 'Home', url: localizedUrl(locale, '') },
              { name: nav?.courses || 'Courses', url: localizedUrl(locale, '/courses') },
              { name: pickLocalized(course as unknown as Record<string, unknown>, 'title', locale), url },
            ]}
          />
        </>
      )}
      {children}
    </>
  );
}
