'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  ArrowRight, Clock, Signal, Users, ChevronDown, ChevronRight,
  BookOpen, CheckCircle2, GraduationCap, Loader2, Tag, Star,
  Monitor, Briefcase, Megaphone, BarChart3, Code2, Container, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Briefcase, Megaphone, BarChart3, Code2, Container, Shield,
};

const gradientMap: Record<string, string> = {
  'traditional-it': 'from-primary-400 to-primary-600',
  'business-it': 'from-primary-500 to-secondary-500',
  'marketing-bd': 'from-amber-500 to-orange-500',
  'data-science': 'from-secondary-500 to-accent-500',
  'sw-engineering': 'from-primary-400 to-primary-500',
  'dev-team': 'from-secondary-600 to-secondary-500',
  'cyber-security': 'from-red-500 to-rose-600',
};

interface SyllabusModule {
  module: string;
  hours: number;
  topics: string[];
}

interface Teacher {
  teacherId: string;
  teacher: {
    id: string;
    nameAz: string;
    nameRu: string;
    nameEn: string;
    photo: string | null;
    specialization: string;
    bioAz: string;
    bioRu: string;
    bioEn: string;
    linkedin: string | null;
  };
}

interface CourseDetail {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  shortDescAz: string;
  shortDescRu: string;
  shortDescEn: string;
  duration: string;
  price: string;
  level: string;
  isActive: boolean;
  isFeatured: boolean;
  syllabus: SyllabusModule[] | null;
  features: string[] | null;
  category: {
    id: string;
    nameAz: string;
    nameRu: string;
    nameEn: string;
    slug: string;
    icon: string;
  };
  teachers: Teacher[];
}

function getLocalized(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}En`] as string) || '';
}

function formatDuration(duration: string, locale: string, t: (key: string) => string): string {
  const match = duration.match(/(\d+)/);
  if (match) {
    return `${match[1]} ${t('months')}`;
  }
  return duration;
}

function AccordionItem({ module, index }: { module: SyllabusModule; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);

  const totalHours = module.hours;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
            {index + 1}
          </span>
          <span className="font-semibold text-gray-900 dark:text-white text-left">{module.module}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">{totalHours} saat</span>
          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
        </div>
      </button>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-5 bg-gray-50/50 dark:bg-gray-900/20">
          <ul className="space-y-2 pt-2">
            {module.topics.map((topic, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <BookOpen className="w-4 h-4 text-primary-500 shrink-0" />
                {topic}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const t = useTranslations('courseDetail');
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get<{ success: boolean; data: CourseDetail }>(`/courses/${slug}`);
        setCourse(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-light dark:bg-bg-dark px-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {locale === 'az' ? 'Kurs tapılmadı' : locale === 'ru' ? 'Курс не найден' : 'Course not found'}
        </h1>
        <Link href="/courses">
          <Button>{locale === 'az' ? 'Kurslara qayıt' : locale === 'ru' ? 'К курсам' : 'Back to courses'}</Button>
        </Link>
      </div>
    );
  }

  const title = getLocalized(course as unknown as Record<string, unknown>, 'title', locale);
  const description = getLocalized(course as unknown as Record<string, unknown>, 'desc', locale);
  const categoryName = getLocalized(course.category as unknown as Record<string, unknown>, 'name', locale);
  const gradient = gradientMap[course.category.slug] || 'from-primary-500 to-secondary-500';
  const IconComp = iconMap[course.category.icon] || GraduationCap;
  const levelLower = course.level.toLowerCase();
  const syllabus = course.syllabus || [];
  const features = course.features || [];
  const totalHours = syllabus.reduce((sum, m) => sum + m.hours, 0);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-bg-light dark:bg-bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <Link href="/" className="hover:text-primary-500 transition-colors">{t('breadcrumbHome')}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/courses" className="hover:text-primary-500 transition-colors">{t('breadcrumbCourses')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{title}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br', gradient)}>
                <IconComp className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{categoryName}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold font-serif-heading text-gray-900 dark:text-white mb-4">{title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mb-6">{description}</p>
            <div className="flex flex-wrap items-center gap-4">
              <span className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold',
                levelLower === 'beginner' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                levelLower === 'intermediate' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
                levelLower === 'advanced' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
              )}>
                <Signal className="w-4 h-4" />
                {t(levelLower)}
              </span>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(course.duration, locale, t)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <BookOpen className="w-4 h-4" />
                <span>{totalHours} {locale === 'az' ? 'saat' : locale === 'ru' ? 'часов' : 'hours'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Tag className="w-4 h-4" />
                <span className="font-semibold">{course.price} ₼</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Features */}
              {features.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {locale === 'az' ? 'Kursun xüsusiyyətləri' : locale === 'ru' ? 'Особенности курса' : 'Course features'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Curriculum */}
              {syllabus.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('curriculum')}</h2>
                  <div className="space-y-3">
                    {syllabus.map((module, i) => (
                      <AccordionItem key={i} module={module} index={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Teachers */}
              {course.teachers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {locale === 'az' ? 'Müəllimlər' : locale === 'ru' ? 'Преподаватели' : 'Instructors'}
                  </h2>
                  <div className="space-y-4">
                    {course.teachers.map(({ teacher }) => {
                      const teacherName = getLocalized(teacher as unknown as Record<string, unknown>, 'name', locale);
                      const teacherBio = getLocalized(teacher as unknown as Record<string, unknown>, 'bio', locale);
                      return (
                        <div key={teacher.id} className="flex items-start gap-4 p-5 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {teacherName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{teacherName}</h3>
                            <p className="text-sm text-primary-500 mb-1">{teacher.specialization}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{teacherBio}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <div className={cn('w-full h-32 rounded-xl bg-gradient-to-br mb-6 flex items-center justify-center', gradient)}>
                  <IconComp className="w-12 h-12 text-white" />
                </div>
                <div className="text-3xl font-bold font-serif-heading text-gray-900 dark:text-white mb-1">{course.price} ₼</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{formatDuration(course.duration, locale, t)}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Signal className="w-4 h-4 text-primary-500" />
                    <span>{t(levelLower)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <BookOpen className="w-4 h-4 text-primary-500" />
                    <span>{syllabus.length} {locale === 'az' ? 'modul' : locale === 'ru' ? 'модулей' : 'modules'} &middot; {totalHours} {locale === 'az' ? 'saat' : locale === 'ru' ? 'часов' : 'hours'}</span>
                  </div>
                  {course.teachers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4 text-primary-500" />
                      <span>{course.teachers.length} {locale === 'az' ? 'müəllim' : locale === 'ru' ? 'преп.' : 'instructor(s)'}</span>
                    </div>
                  )}
                  {course.isFeatured && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{locale === 'az' ? 'Populyar kurs' : locale === 'ru' ? 'Популярный курс' : 'Popular course'}</span>
                    </div>
                  )}
                </div>

                <Link href="/apply">
                  <Button className="w-full" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>{t('applyButton')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
