'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight, Clock, Signal, Users, Baby, Loader2,
  Monitor, Briefcase, TrendingUp, Database, Code, Container, Shield, GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

/* ─── Icon mapping by category slug ──────────────────────────────────────── */
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'traditional-it': Monitor,
  'business-it': Briefcase,
  'marketing-bd': TrendingUp,
  'data-science': Database,
  'sw-engineering': Code,
  'dev-team': Container,
  'cyber-security': Shield,
  'kids-programs': GraduationCap,
  // Kids subcategories
  'kids-ai': Database,
  'kids-cybersecurity': Shield,
  'kids-programming': Code,
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  'traditional-it': 'from-gray-500 to-gray-600',
  'business-it': 'from-purple-500 to-violet-600',
  'marketing-bd': 'from-amber-500 to-orange-500',
  'data-science': 'from-emerald-500 to-teal-600',
  'sw-engineering': 'from-primary-400 to-primary-600',
  'dev-team': 'from-fuchsia-500 to-pink-600',
  'cyber-security': 'from-red-500 to-rose-600',
  'kids-programs': 'from-orange-500 to-amber-500',
  'kids-ai': 'from-violet-500 to-purple-600',
  'kids-cybersecurity': 'from-red-500 to-orange-500',
  'kids-programming': 'from-emerald-500 to-green-600',
};

const BORDER_GRADIENTS: Record<string, string> = {
  'traditional-it': 'from-gray-500/50 to-gray-600/50',
  'business-it': 'from-purple-500/50 to-violet-600/50',
  'marketing-bd': 'from-amber-500/50 to-orange-500/50',
  'data-science': 'from-emerald-500/50 to-teal-600/50',
  'sw-engineering': 'from-primary-400/50 to-primary-600/50',
  'dev-team': 'from-fuchsia-500/50 to-pink-600/50',
  'cyber-security': 'from-red-500/50 to-rose-600/50',
  'kids-programs': 'from-orange-500/50 to-amber-500/50',
  'kids-ai': 'from-violet-500/50 to-purple-600/50',
  'kids-cybersecurity': 'from-red-500/50 to-orange-500/50',
  'kids-programming': 'from-emerald-500/50 to-green-600/50',
};

/* ─── Kids virtual subcategories (by course slug) ────────────────────────── */
const KIDS_SUBCATEGORIES: { slug: string; nameEn: string; nameAz: string; nameRu: string; matchPrefix: string; icon: React.ElementType }[] = [
  { slug: 'kids-ai', nameEn: 'AI & Technology', nameAz: 'AI & Texnologiya', nameRu: 'AI & Технологии', matchPrefix: 'kids-ai', icon: Database },
  { slug: 'kids-cybersecurity', nameEn: 'Cybersecurity', nameAz: 'Kibertəhlükəsizlik', nameRu: 'Кибербезопасность', matchPrefix: 'kids-cyber', icon: Shield },
  { slug: 'kids-programming', nameEn: 'Programming', nameAz: 'Proqramlaşdırma', nameRu: 'Программирование', matchPrefix: 'kids-program', icon: Code },
];

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface ApiCategory {
  id: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  slug: string;
  icon?: string;
  order: number;
}

interface ApiCourse {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  shortDescAz?: string;
  shortDescRu?: string;
  shortDescEn?: string;
  descAz: string;
  descRu: string;
  descEn: string;
  duration: string;
  price?: number;
  level: string;
  audience: string;
  ageGroup?: string;
  categoryId: string;
  category?: { slug: string };
}

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}En`] as string) || '';
}

function getLevelKey(level: string): string {
  return level.toLowerCase();
}

function parseDurationMonths(duration: string): string {
  const match = duration.match(/(\d+)/);
  return match ? match[1] : duration;
}

/* ─── Course Card ─────────────────────────────────────────────────────────── */
function CourseCard({ course, catSlug, isKids, locale, t }: {
  course: ApiCourse;
  catSlug: string;
  isKids: boolean;
  locale: string;
  t: (key: string) => string;
}) {
  const title = getLocalized(course as unknown as Record<string, unknown>, 'title', locale);
  const shortDesc = getLocalized(course as unknown as Record<string, unknown>, 'shortDesc', locale)
    || getLocalized(course as unknown as Record<string, unknown>, 'desc', locale);
  const gradient = CATEGORY_GRADIENTS[catSlug] || 'from-primary-500 to-secondary-500';
  const Icon = CATEGORY_ICONS[catSlug] || GraduationCap;
  const levelKey = getLevelKey(course.level);
  const months = parseDurationMonths(course.duration);

  return (
    <Link href={`/courses/${course.slug}`} className="cursor-pointer">
      <div className={cn(
        'group relative flex flex-col overflow-hidden classical-card hover:-translate-y-1 transition-all duration-300',
        isKids
          ? 'rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-orange-950/40 dark:to-amber-950/30 border-2 border-orange-200/60 dark:border-orange-800/30'
          : 'rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800'
      )}>
        <div className={cn('w-full bg-gradient-to-r', gradient, isKids ? 'h-2' : 'h-1')} />
        <div className="flex flex-col flex-1 p-6">
          <div className={cn('flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg', gradient, isKids ? 'w-14 h-14 rounded-lg' : 'w-12 h-12 rounded-lg')}>
            <Icon className={cn('text-white', isKids ? 'w-7 h-7' : 'w-6 h-6')} />
          </div>
          <h3 className={cn(
            'font-bold font-serif-heading mb-2 transition-colors',
            isKids
              ? 'text-xl text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400'
              : 'text-lg text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400'
          )}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1 line-clamp-2">
            {shortDesc}
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Signal className={cn('w-3.5 h-3.5', isKids ? 'text-orange-500' : 'text-primary-500')} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {t(`courses.${levelKey}`)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className={cn('w-3.5 h-3.5', isKids ? 'text-orange-500' : 'text-primary-500')} />
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {months} {t('courses.months')}
              </span>
            </div>
          </div>
          <div className={cn(
            'flex items-center justify-between pt-4 border-t',
            isKids ? 'border-orange-200/50 dark:border-orange-800/30' : 'border-gray-100 dark:border-gray-800'
          )}>
            <span className={cn(
              'text-sm font-semibold group-hover:underline',
              isKids ? 'text-orange-600 dark:text-orange-400' : 'text-primary-600 dark:text-primary-400'
            )}>
              {t('courses.learnMore')}
            </span>
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
              isKids ? 'bg-orange-100 dark:bg-orange-900/20 group-hover:bg-orange-500' : 'bg-primary-50 dark:bg-primary-900/20 group-hover:bg-primary-500'
            )}>
              <ArrowRight className={cn('w-4 h-4 group-hover:text-white transition-colors', isKids ? 'text-orange-500' : 'text-primary-500')} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ─── Main Section ────────────────────────────────────────────────────────── */
export function CoursesSection() {
  const t = useTranslations('home');
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'adults' | 'kids'>('adults');
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const isKids = activeTab === 'kids';

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, courseRes] = await Promise.all([
          api.get<{ success: boolean; data: ApiCategory[] }>('/categories'),
          api.get<{ success: boolean; data: ApiCourse[] }>('/courses?limit=100'),
        ]);
        const cats = catRes.data || [];
        const crs = courseRes.data || [];
        setCategories(cats);
        setCourses(crs);
        // Set initial active category to first adult category
        const adultCats = cats.filter(c => c.slug !== 'kids-programs');
        if (adultCats.length > 0) setActiveCategory(adultCats[0].slug);
      } catch {
        // Fallback: no data
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const adultCategories = categories.filter(c => c.slug !== 'kids-programs');
  const adultCourses = courses.filter(c => c.audience === 'ADULTS');
  const kidsCourses = courses.filter(c => c.audience === 'KIDS');

  // Determine which kids subcategories actually have courses
  const activeKidsSubcats = KIDS_SUBCATEGORIES.filter(sc =>
    kidsCourses.some(c => c.slug.startsWith(sc.matchPrefix))
  );

  const [activeKidsCategory, setActiveKidsCategory] = useState<string>('all');

  // Courses for current view
  const currentCourses = isKids
    ? activeKidsCategory === 'all'
      ? kidsCourses
      : kidsCourses.filter(c => {
          const subcat = KIDS_SUBCATEGORIES.find(sc => sc.slug === activeKidsCategory);
          return subcat ? c.slug.startsWith(subcat.matchPrefix) : true;
        })
    : adultCourses.filter(c => {
        const cat = categories.find(cat => cat.id === c.categoryId);
        return cat?.slug === activeCategory;
      });

  // Get category slug for a course (for icon/gradient lookup)
  const getCatSlug = (course: ApiCourse) => {
    if (course.audience === 'KIDS') {
      // Use course slug for kids icon/gradient matching
      const subcat = KIDS_SUBCATEGORIES.find(sc => course.slug.startsWith(sc.matchPrefix));
      return subcat?.slug || 'kids-programs';
    }
    const cat = categories.find(c => c.id === course.categoryId);
    return cat?.slug || '';
  };

  if (loading) {
    return (
      <section className="py-20 sm:py-28 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      </section>
    );
  }

  if (courses.length === 0) return null;

  return (
    <section className={cn(
      'py-20 sm:py-28 transition-colors duration-500',
      isKids
        ? 'bg-gradient-to-b from-orange-50/50 to-amber-50/30 dark:from-orange-950/10 dark:to-amber-950/5'
        : 'bg-gray-50/50 dark:bg-gray-900/30'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-14">
          <div className="relative hidden lg:block">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <img src="/images/coding-workspace.jpg" alt="Modern coding workspace" className="w-full h-[280px] object-cover" />
            </div>
          </div>
          <div className="text-center lg:text-left">
            <span className="section-subtitle mb-3 block">
              {isKids ? `— ${t('courses.juniorPrograms')} —` : `— ${t('courses.academicPrograms')} —`}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-heading tracking-elegant text-gray-900 dark:text-white mb-3">
              {isKids ? t('courses.kidsTitle') : t('courses.title')}
            </h2>
            <div className="flex items-center gap-0 mb-5 justify-center lg:justify-start">
              <div className="h-px w-10 bg-gradient-to-r from-transparent to-secondary-300 dark:to-secondary-700" />
              <div className="w-1.5 h-1.5 rotate-45 bg-secondary-500 mx-2" />
              <div className="h-px w-10 bg-gradient-to-l from-transparent to-secondary-300 dark:to-secondary-700" />
            </div>
            <p className="max-w-2xl mx-auto lg:mx-0 text-lg text-gray-500 dark:text-gray-400 mb-6">
              {isKids ? t('courses.kidsSubtitle') : t('courses.subtitle')}
            </p>
            <div className="flex items-center gap-2 justify-center lg:justify-start">
              <button
                onClick={() => setActiveTab('adults')}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                  activeTab === 'adults'
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                )}
              >
                <Users className="w-4 h-4" />
                {t('courses.adultsLabel')}
              </button>
              {kidsCourses.length > 0 && (
                <button
                  onClick={() => setActiveTab('kids')}
                  className={cn(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                    activeTab === 'kids'
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                      : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  )}
                >
                  <Baby className="w-4 h-4" />
                  {t('courses.kidsLabel')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Adult category tabs */}
        {!isKids && adultCategories.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            {adultCategories.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat.slug] || GraduationCap;
              const catName = getLocalized(cat as unknown as Record<string, unknown>, 'name', locale);
              return (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border',
                    activeCategory === cat.slug
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                      : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-primary-300'
                  )}
                >
                  <CatIcon className="w-3.5 h-3.5" />
                  {catName}
                </button>
              );
            })}
          </div>
        )}

        {/* Kids category tabs */}
        {isKids && activeKidsSubcats.length > 1 && (
          <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
            <button
              onClick={() => setActiveKidsCategory('all')}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border',
                activeKidsCategory === 'all'
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-300'
              )}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              {locale === 'az' ? 'Hamısı' : locale === 'ru' ? 'Все' : 'All'}
            </button>
            {activeKidsSubcats.map((sc) => {
              const SubIcon = sc.icon;
              const name = locale === 'az' ? sc.nameAz : locale === 'ru' ? sc.nameRu : sc.nameEn;
              return (
                <button
                  key={sc.slug}
                  onClick={() => setActiveKidsCategory(sc.slug)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 border',
                    activeKidsCategory === sc.slug
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                      : 'bg-white dark:bg-surface-dark text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                  )}
                >
                  <SubIcon className="w-3.5 h-3.5" />
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {currentCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              catSlug={getCatSlug(course)}
              isKids={isKids}
              locale={locale}
              t={t}
            />
          ))}
        </div>

        {/* View all button */}
        <div className="text-center">
          <Link href="/courses">
            <Button size="lg" variant="outline" rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t('courses.viewAll')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
