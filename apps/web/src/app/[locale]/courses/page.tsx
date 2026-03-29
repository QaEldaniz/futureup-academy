import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CoursesPage({ params }: Props) {
  const { locale } = await params;
  const prefix = locale === 'az' ? '' : `/${locale}`;
  redirect(`${prefix}/courses/kids`);
}
