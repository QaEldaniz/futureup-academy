import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight, Clock, Signal, Users, ChevronDown, ChevronRight,
  BookOpen, CheckCircle2, GraduationCap, Tag, Star, HelpCircle,
  Monitor, Briefcase, Megaphone, BarChart3, Code2, Container, Shield,
  Wifi, MapPin, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCourse, getAllCourses, getCourseReviews } from '@/lib/server-data';
import { pickLocalized } from '@/lib/seo';
import { buildCourseFaq } from '@/lib/course-faq';
import { FaqJsonLd } from '@/components/seo/StructuredData';

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

type Props = { params: Promise<{ locale: string; slug: string }> };

const L = (locale: string, az: string, ru: string, en: string) =>
  locale === 'az' ? az : locale === 'ru' ? ru : en;

export default async function CourseDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const course = await getCourse(slug);
  if (!course) notFound();

  const t = await getTranslations({ locale, namespace: 'courseDetail' });
  const rec = course as unknown as Record<string, unknown>;

  const title = pickLocalized(rec, 'title', locale);
  const description = pickLocalized(rec, 'desc', locale);
  const categoryName = course.category
    ? pickLocalized(course.category as unknown as Record<string, unknown>, 'name', locale)
    : '';
  const gradient = gradientMap[course.category?.slug || ''] || 'from-primary-500 to-secondary-500';
  const IconComp = iconMap[course.category?.icon || ''] || GraduationCap;
  const levelLower = (course.level || 'beginner').toLowerCase();
  const syllabus = course.syllabus || [];
  const features = course.features || [];
  const totalHours = syllabus.reduce((sum, m) => sum + (m.hours || 0), 0);
  const hoursLabel = L(locale, 'saat', 'часов', 'hours');
  const hasCert = features.some((f) => /sertifikat|certif|сертифик/i.test(f));

  const faq = buildCourseFaq(course, locale, title);

  // Related courses: same category, excluding this one.
  const all = (await getAllCourses()) || [];
  const related = all
    .filter((c) => c.slug !== slug && c.category?.slug === course.category?.slug)
    .slice(0, 3);

  // Reviews → on-page section + (in layout) AggregateRating. None yet → renders nothing.
  const reviews = course.id ? (await getCourseReviews(course.id)) || [] : [];

  // Keyword-rich lead paragraph built purely from real course data.
  const lead = L(
    locale,
    `${title} — FutureUp Academy-nin ${categoryName} sahəsi üzrə kursudur. Bakıda əyani və onlayn formatda keçirilir${course.duration ? `, ${course.duration} davam edir` : ''}${totalHours ? ` (${totalHours} saat, ${syllabus.length} modul)` : ''}. ${description}`,
    `${title} — курс FutureUp Academy по направлению «${categoryName}». Проходит в Баку очно и онлайн${course.duration ? `, длится ${course.duration}` : ''}${totalHours ? ` (${totalHours} часов, ${syllabus.length} модулей)` : ''}. ${description}`,
    `${title} is a FutureUp Academy course in ${categoryName}. Taught in Baku on-site and online${course.duration ? `, running ${course.duration}` : ''}${totalHours ? ` (${totalHours} hours, ${syllabus.length} modules)` : ''}. ${description}`,
  );

  return (
    <>
      {faq.length > 0 && <FaqJsonLd items={faq} />}

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-bg-light dark:bg-bg-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <Link href="/" className="hover:text-primary-500 transition-colors">{t('breadcrumbHome')}</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/courses" className="hover:text-primary-500 transition-colors">{t('breadcrumbCourses')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white font-medium">{title}</span>
          </nav>

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
            <div className="flex items-center gap-1.5 text-gray-500"><Clock className="w-4 h-4" /><span>{course.duration}</span></div>
            <div className="flex items-center gap-1.5 text-gray-500"><BookOpen className="w-4 h-4" /><span>{totalHours} {hoursLabel}</span></div>
            <div className="flex items-center gap-1.5 text-gray-500"><Tag className="w-4 h-4" /><span className="font-semibold">{course.price} ₼</span></div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {L(locale, 'Kurs haqqında', 'О курсе', 'About the course')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{lead}</p>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {L(locale, 'Kursun xüsusiyyətləri', 'Особенности курса', 'Course features')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum — native <details> = server-rendered + interactive, no JS */}
              {syllabus.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('curriculum')}</h2>
                  <div className="space-y-3">
                    {syllabus.map((module, i) => (
                      <details key={i} open={i === 0} className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <summary className="flex items-center justify-between p-5 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
                            <span className="font-semibold text-gray-900 dark:text-white text-left">{module.module}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 hidden sm:block">{module.hours} {hoursLabel}</span>
                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                          </div>
                        </summary>
                        <div className="px-5 pb-5 bg-gray-50/50 dark:bg-gray-900/20">
                          <ul className="space-y-2 pt-2">
                            {module.topics.map((topic, j) => (
                              <li key={j} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <BookOpen className="w-4 h-4 text-primary-500 shrink-0" />{topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructors */}
              {course.teachers && course.teachers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {L(locale, 'Müəllimlər', 'Преподаватели', 'Instructors')}
                  </h2>
                  <div className="space-y-4">
                    {course.teachers.map(({ teacher }) => {
                      const teacherName = pickLocalized(teacher as unknown as Record<string, unknown>, 'name', locale);
                      const teacherBio = pickLocalized(teacher as unknown as Record<string, unknown>, 'bio', locale);
                      return (
                        <div key={teacher.id} className="flex items-start gap-4 p-5 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                          {teacher.photo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={teacher.photo} alt={teacherName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-lg shrink-0">{teacherName.charAt(0)}</div>
                          )}
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{teacherName}</h3>
                            <p className="text-sm text-primary-500 mb-1">{teacher.specialization}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{teacherBio}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews — renders when approved reviews exist (also powers AggregateRating) */}
              {reviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {L(locale, 'Rəylər', 'Отзывы', 'Reviews')}
                  </h2>
                  <div className="space-y-4">
                    {reviews.slice(0, 6).map((r, i) => (
                      <div key={i} className="p-5 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className={cn('w-4 h-4', s < Math.round(r.rating) ? 'text-amber-400 fill-current' : 'text-gray-300')} />
                          ))}
                        </div>
                        {r.text && <p className="text-sm text-gray-600 dark:text-gray-400">{r.text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ — server-rendered <details> + FAQPage JSON-LD (long-tail capture) */}
              {faq.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary-500" />
                    {L(locale, 'Tez-tez verilən suallar', 'Частые вопросы', 'Frequently asked questions')}
                  </h2>
                  <div className="space-y-3">
                    {faq.map((item, i) => (
                      <details key={i} className="group border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                        <summary className="flex items-center justify-between gap-4 p-5 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                          <span className="font-semibold text-gray-900 dark:text-white">{item.question}</span>
                          <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180" />
                        </summary>
                        <div className="px-5 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Related courses — internal linking + topical clustering */}
              {related.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {L(locale, 'Oxşar kurslar', 'Похожие курсы', 'Related courses')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {related.map((c) => {
                      const cTitle = pickLocalized(c as unknown as Record<string, unknown>, 'title', locale);
                      const cShort = pickLocalized(c as unknown as Record<string, unknown>, 'shortDesc', locale);
                      return (
                        <Link key={c.slug} href={`/courses/${c.slug}`} className="group block p-5 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{cTitle}</h3>
                          {cShort && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{cShort}</p>}
                          <span className="inline-flex items-center gap-1 text-sm text-primary-500 mt-3">{L(locale, 'Ətraflı', 'Подробнее', 'Learn more')}<ArrowRight className="w-3.5 h-3.5" /></span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar: price / format / enrol */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-lg bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
                <div className={cn('w-full h-32 rounded-xl bg-gradient-to-br mb-6 flex items-center justify-center', gradient)}>
                  <IconComp className="w-12 h-12 text-white" />
                </div>
                <div className="text-3xl font-bold font-serif-heading text-gray-900 dark:text-white mb-1">{course.price} ₼</div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {L(locale, 'Taksit imkanı mövcuddur', 'Доступна рассрочка', 'Installment available')}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Clock className="w-4 h-4 text-primary-500" /><span>{course.duration} &middot; {totalHours} {hoursLabel}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Signal className="w-4 h-4 text-primary-500" /><span>{t(levelLower)}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><BookOpen className="w-4 h-4 text-primary-500" /><span>{syllabus.length} {L(locale, 'modul', 'модулей', 'modules')}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4 text-primary-500" /><span>{L(locale, 'Əyani — Bakı', 'Очно — Баку', 'On-site — Baku')}</span></div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Wifi className="w-4 h-4 text-primary-500" /><span>{L(locale, 'Onlayn', 'Онлайн', 'Online')}</span></div>
                  {hasCert && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Award className="w-4 h-4 text-primary-500" /><span>{L(locale, 'Sertifikat', 'Сертификат', 'Certificate')}</span></div>}
                  {course.teachers && course.teachers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><Users className="w-4 h-4 text-primary-500" /><span>{course.teachers.length} {L(locale, 'müəllim', 'преп.', 'instructor(s)')}</span></div>
                  )}
                  {course.isFeatured && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400"><Star className="w-4 h-4 fill-current" /><span>{L(locale, 'Populyar kurs', 'Популярный курс', 'Popular course')}</span></div>
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
