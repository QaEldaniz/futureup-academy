import { cache } from 'react';

/** Resolve the API base the same way the client does, but always absolute (for SSR). */
function apiBase(): string {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/+$/, '');
  if (!url.endsWith('/api')) url += '/api';
  return url;
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiBase()}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data ?? json) as T;
  } catch {
    return null;
  }
}

export interface SeoSyllabusModule {
  module: string;
  hours: number;
  topics: string[];
}

export interface SeoCourseTeacher {
  teacher: {
    id: string;
    nameAz: string; nameRu: string; nameEn: string;
    photo: string | null;
    specialization: string;
    bioAz: string; bioRu: string; bioEn: string;
    linkedin: string | null;
  };
}

export interface SeoCourse {
  id?: string;
  slug: string;
  titleAz: string; titleRu: string; titleEn: string;
  shortDescAz?: string; shortDescRu?: string; shortDescEn?: string;
  descAz?: string; descRu?: string; descEn?: string;
  price?: string;
  duration?: string;
  level?: string;
  audience?: string;
  isFeatured?: boolean;
  image?: string | null;
  syllabus?: SeoSyllabusModule[] | null;
  features?: string[] | null;
  teachers?: SeoCourseTeacher[];
  updatedAt?: string;
  category?: { id?: string; nameAz: string; nameRu: string; nameEn: string; slug: string; icon?: string };
}

export interface SeoReview {
  rating: number;
  text?: string;
  createdAt?: string;
}

export interface SeoNews {
  slug: string;
  titleAz: string; titleRu: string; titleEn: string;
  excerptAz?: string; excerptRu?: string; excerptEn?: string;
  contentAz?: string; contentRu?: string; contentEn?: string;
  image?: string;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Cached per-request: generateMetadata + the layout JSON-LD share one fetch. */
export const getCourse = cache((slug: string) => getJson<SeoCourse>(`/courses/${slug}`));
export const getNewsArticle = cache((slug: string) => getJson<SeoNews>(`/news/${slug}`));

export const getAllCourses = cache(() => getJson<SeoCourse[]>(`/courses?limit=200`));
export const getAllNews = cache(() => getJson<SeoNews[]>(`/news?limit=200`));
export const getCategories = cache((audience: string) =>
  getJson<Record<string, unknown>[]>(`/categories?audience=${audience}`),
);
export const getAllCategories = cache(() => getJson<Record<string, unknown>[]>(`/categories`));

/** Approved public reviews for a course — used for AggregateRating + on-page reviews. */
export const getCourseReviews = cache((courseId: string) =>
  getJson<SeoReview[]>(`/reviews/course/${courseId}`),
);
