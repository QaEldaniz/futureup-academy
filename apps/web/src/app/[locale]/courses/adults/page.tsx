import CoursesPageContent, { type Course, type Category } from '../_components';
import { getAllCourses, getCategories } from '@/lib/server-data';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || '';

export default async function AdultsCoursesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [courses, categories] = await Promise.all([getAllCourses(), getCategories('ADULTS')]);
  return (
    <CoursesPageContent
      audience="ADULTS"
      initialCourses={courses ? (courses as unknown as Course[]) : undefined}
      initialCategories={categories ? (categories as unknown as Category[]) : undefined}
      initialCategory={one(sp.category) || 'all'}
      initialAge={one(sp.age) || 'all'}
      initialSearch={one(sp.q)}
    />
  );
}
