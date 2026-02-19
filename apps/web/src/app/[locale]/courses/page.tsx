'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  Code2, Server, Palette, BarChart3, Shield, Megaphone,
  ArrowRight, Clock, Signal, Search, SlidersHorizontal,
  GraduationCap, Sparkles, Monitor, Briefcase, Container,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Briefcase, Megaphone, BarChart3, Code2, Container, Shield,
  Server, Palette,
};

const gradientMap: Record<string, string> = {
  'traditional-it': 'from-sky-500 to-blue-600',
  'business-it': 'from-indigo-500 to-purple-600',
  'marketing-bd': 'from-amber-500 to-orange-500',
  'data-science': 'from-purple-500 to-violet-600',
  'sw-engineering': 'from-blue-500 to-cyan-500',
  'dev-team': 'from-green-500 to-emerald-500',
  'cyber-security': 'from-red-500 to-rose-600',
};

interface Category {
  id: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  icon: string;
  order: number;
  _count: { courses: number };
}

interface Course {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  shortDescAz: string;
  shortDescRu: string;
  shortDescEn: string;
  duration: string;
  price: string;
  level: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  features: string[];
  category: Category;
}

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}En`] as string) || '';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

function formatDuration(duration: string, locale: string, t: (key: string) => string): string {
  const match = duration.match(/(\d+)/);
  if (match) {
    return `${match[1]} ${t('months')}`;
  }
  return duration;
}

function CourseCard({ course, locale }: { course: Course; locale: string }) {
  const t = useTranslations('courses');
  const title = getLocalized(course as unknown as Record<string, unknown>, 'title', locale);
  const shortDesc = getLocalized(course as unknown as Record<string, unknown>, 'shortDesc', locale);
  const gradient = gradientMap[course.category.slug] || 'from-primary-500 to-secondary-500';
  const IconComp = iconMap[course.category.icon] || GraduationCap;
  const levelLower = course.level.toLowerCase() as 'beginner' | 'intermediate' | 'advanced';

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/courses/${course.slug}`}>
        <div className={cn(
          'group relative flex flex-col rounded-2xl overflow-hidden h-full',
          'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800',
          'hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1',
          'transition-all duration-300 cursor-pointer'
        )}>
          <div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />
          <div className="flex flex-col flex-1 p-6">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg', gradient)}>
              <IconComp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
              {shortDesc}
            </p>
            <div className="flex items-center gap-3 mb-4">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold',
                levelLower === 'beginner' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                levelLower === 'intermediate' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                levelLower === 'advanced' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
              )}>
                <Signal className="w-3 h-3" />
                {t(levelLower)}
              </span>
              <div className="flex items-center gap-1.5 text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{formatDuration(course.duration, locale, t)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
              <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                {course.price} ₼
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                <ArrowRight className="w-4 h-4 text-primary-500 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CoursesPage() {
  const t = useTranslations('courses');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesRes, categoriesRes] = await Promise.all([
          api.get<{ success: boolean; data: Course[] }>('/courses?limit=50'),
          api.get<{ success: boolean; data: Category[] }>('/categories'),
        ]);
        setCourses(coursesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return courses.filter((course) => {
      if (!course.isActive) return false;
      const matchesCategory = selectedCategory === 'all' || course.category.slug === selectedCategory;
      if (!q) return matchesCategory;
      const title = getLocalized(course as unknown as Record<string, unknown>, 'title', locale).toLowerCase();
      const desc = getLocalized(course as unknown as Record<string, unknown>, 'shortDesc', locale).toLowerCase();
      const catName = getLocalized(course.category as unknown as Record<string, unknown>, 'name', locale).toLowerCase();
      const matchesSearch = title.includes(q) || desc.includes(q) || catName.includes(q) || course.slug.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [courses, selectedCategory, searchQuery, locale]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(108,60,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/30 mb-6">
            <GraduationCap className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Academy</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            {t('title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </motion.p>
          {!loading && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 text-sm text-gray-500 dark:text-gray-500">
              {courses.length} {locale === 'az' ? 'kurs mövcuddur' : locale === 'ru' ? 'курсов доступно' : 'courses available'}
            </motion.p>
          )}
        </div>
      </section>

      {/* Filters + Grid */}
      <section className="py-12 sm:py-16 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col lg:flex-row gap-4 mb-10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder={t('search') || 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory('all')}
                className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  selectedCategory === 'all' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300')}>
                <SlidersHorizontal className="w-4 h-4" />
                {t('allCategories')}
              </button>
              {categories.map((cat) => {
                const CatIcon = iconMap[cat.icon] || GraduationCap;
                const isActive = selectedCategory === cat.slug;
                const catName = getLocalized(cat as unknown as Record<string, unknown>, 'name', locale);
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)}
                    className={cn('inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300')}>
                    <CatIcon className="w-4 h-4" />
                    {catName}
                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full', isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800')}>{cat._count.courses}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-500">{t('noResults')}</p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" key={selectedCategory + searchQuery} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} locale={locale} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-bg-light dark:bg-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-transparent to-accent-50 dark:from-primary-900/10 dark:via-transparent dark:to-accent-900/10" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkles className="w-10 h-10 text-primary-500 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">{t('apply')}</h2>
            <Link href="/apply">
              <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>{t('apply')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
