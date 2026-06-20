import type { MetadataRoute } from 'next';
import { getAllCourses, getAllNews } from '@/lib/server-data';
import { SITE_URL, LOCALES, DEFAULT_LOCALE } from '@/lib/seo';

type ChangeFreq = MetadataRoute.Sitemap[number]['changeFrequency'];

const prefix = (l: string) => (l === DEFAULT_LOCALE ? '' : `/${l}`);

function entry(
  path: string,
  opts: { changeFrequency?: ChangeFreq; priority?: number; lastModified?: Date } = {},
): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${SITE_URL}${prefix(l)}${path}`;
  return {
    url: `${SITE_URL}${path}`,
    lastModified: opts.lastModified ?? new Date(),
    changeFrequency: opts.changeFrequency ?? 'monthly',
    priority: opts.priority ?? 0.7,
    alternates: { languages },
  };
}

const safeDate = (v?: string | null): Date | undefined => {
  if (!v) return undefined;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: { path: string; changeFrequency?: ChangeFreq; priority?: number }[] = [
    { path: '', changeFrequency: 'weekly', priority: 1.0 },
    { path: '/courses', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/courses/adults', priority: 0.8 },
    { path: '/courses/kids', priority: 0.8 },
    { path: '/teachers', priority: 0.7 },
    { path: '/corporate', priority: 0.7 },
    { path: '/about', priority: 0.6 },
    { path: '/contact', priority: 0.6 },
    { path: '/faq', priority: 0.6 },
    { path: '/news', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/apply', priority: 0.8 },
  ];

  const entries: MetadataRoute.Sitemap = staticPages.map((p) =>
    entry(p.path, { changeFrequency: p.changeFrequency, priority: p.priority }),
  );

  // Dynamic: every active course + published news article. Gracefully skips if API is unreachable.
  const [courses, news] = await Promise.all([getAllCourses(), getAllNews()]);

  for (const c of courses || []) {
    if (!c?.slug) continue;
    entries.push(entry(`/courses/${c.slug}`, { priority: 0.8, lastModified: safeDate(c.updatedAt) }));
  }
  for (const n of news || []) {
    if (!n?.slug) continue;
    entries.push(
      entry(`/news/${n.slug}`, {
        changeFrequency: 'monthly',
        priority: 0.5,
        lastModified: safeDate(n.updatedAt || n.publishedAt || n.createdAt),
      }),
    );
  }

  return entries;
}
