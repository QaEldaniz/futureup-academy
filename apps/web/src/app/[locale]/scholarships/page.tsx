'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Calendar,
  Percent,
  Users,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Star,
  TrendingUp,
} from 'lucide-react';

interface Scholarship {
  id: string;
  slug?: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  coverageAz?: string;
  coverageRu?: string;
  coverageEn?: string;
  eligibilityAz: string;
  eligibilityRu: string;
  eligibilityEn: string;
  percentage?: number;
  amount?: number;
  deadline?: string;
  isActive: boolean;
  order?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const gradients = [
  'from-primary-500 to-secondary-500',
  'from-accent-500 to-primary-500',
  'from-secondary-500 to-secondary-600',
  'from-primary-400 to-primary-600',
  'from-pink-500 to-rose-500',
  'from-amber-500 to-orange-500',
  'from-primary-500 to-secondary-500',
  'from-red-500 to-rose-500',
];

const cardIcons = [Award, Star, GraduationCap, BookOpen, TrendingUp, Sparkles];

const stats = [
  { value: '50+', labelAz: 'Təqaüd verilmişdir', labelRu: 'Стипендий выдано', labelEn: 'Scholarships awarded' },
  { value: '100%', labelAz: 'Tam təqaüd mövcuddur', labelRu: 'Полная стипендия доступна', labelEn: 'Full scholarship available' },
  { value: '200+', labelAz: 'Müraciət qəbul edilmişdir', labelRu: 'Заявок принято', labelEn: 'Applications received' },
  { value: '92%', labelAz: 'Məmnuniyyət dərəcəsi', labelRu: 'Уровень удовлетворённости', labelEn: 'Satisfaction rate' },
];

function getLocalizedText(item: Scholarship, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  const key = `${field}${suffix}` as keyof Scholarship;
  const fallbackKey = `${field}Az` as keyof Scholarship;
  return (item[key] as string) || (item[fallbackKey] as string) || '';
}

function formatDeadline(date: string, locale: string): string {
  return new Intl.DateTimeFormat(
    locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : 'en-US',
    { year: 'numeric', month: 'long', day: 'numeric' }
  ).format(new Date(date));
}

function getText(locale: string, az: string, ru: string, en: string): string {
  if (locale === 'ru') return ru;
  if (locale === 'en') return en;
  return az;
}


export default function ScholarshipsPage() {
  const locale = useLocale();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ success: boolean; data: Scholarship[] }>('/scholarships')
      .then((res) => {
        const items = Array.isArray(res) ? res : res.data;
        if (Array.isArray(items)) {
          setScholarships(items);
        }
      })
      .catch(() => {
        // API not available
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/30 mb-6"
          >
            <GraduationCap className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Academy</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-heading tracking-tight text-gray-900 dark:text-white mb-4"
          >
            {getText(locale, 'Təqaüd Proqramları', 'Стипендиальные Программы', 'Scholarship Programs')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400"
          >
            {getText(
              locale,
              'Gələcəyinə investisiya qoy. FutureUp Academy təqaüd proqramları ilə arzularına bir addım daha yaxınlaş.',
              'Инвестируй в своё будущее. Приблизься к своим мечтам со стипендиальными программами FutureUp Academy.',
              'Invest in your future. Get one step closer to your dreams with FutureUp Academy scholarship programs.'
            )}
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800"
              >
                <p className="text-3xl sm:text-4xl font-bold font-serif-heading text-primary-500 dark:text-primary-400 mb-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {getText(locale, stat.labelAz, stat.labelRu, stat.labelEn)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scholarship Cards */}
      <section className="py-16 sm:py-20 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-gray-900 dark:text-white mb-4">
              {getText(locale, 'Mövcud Təqaüdlər', 'Доступные Стипендии', 'Available Scholarships')}
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {getText(
                locale,
                'Sizin üçün ən uyğun təqaüd proqramını seçin və müraciət edin.',
                'Выберите наиболее подходящую для вас стипендиальную программу и подайте заявку.',
                'Choose the most suitable scholarship program and apply.'
              )}
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 p-8 animate-pulse"
                >
                  <div className="w-14 h-14 rounded-lg bg-gray-200 dark:bg-gray-700 mb-6" />
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/3" />
                </div>
              ))}
            </div>
          ) : scholarships.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {getText(locale, 'Hazırda təqaüd proqramı yoxdur', 'Сейчас нет стипендиальных программ', 'No scholarship programs available')}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                {getText(locale, 'Yeni proqramlar tezliklə əlavə olunacaq', 'Новые программы будут добавлены в ближайшее время', 'New programs will be added soon')}
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {scholarships.map((scholarship, index) => {
                const gradient = gradients[index % gradients.length];
                const Icon = cardIcons[index % cardIcons.length];
                const title = getLocalizedText(scholarship, 'title', locale);
                const description = getLocalizedText(scholarship, 'desc', locale);
                const eligibility = getLocalizedText(scholarship, 'eligibility', locale);

                return (
                  <motion.div key={scholarship.id} variants={cardVariants}>
                    <div
                      className={cn(
                        'group relative flex flex-col rounded-lg overflow-hidden h-full',
                        'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800',
                        'hover:shadow-xl hover:-translate-y-1',
                        'transition-all duration-300'
                      )}
                    >
                      {/* Top gradient bar */}
                      <div className={cn('h-1.5 w-full bg-gradient-to-r', gradient)} />

                      <div className="flex flex-col flex-1 p-8">
                        {/* Icon and coverage badge */}
                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={cn(
                              'w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-lg',
                              gradient
                            )}
                          >
                            <Icon className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200/50 dark:border-green-700/30">
                            <Percent className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-bold text-green-700 dark:text-green-400">
                              {scholarship.percentage ?? 0}%
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>

                        {/* Description */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6 flex-1">
                          {description}
                        </p>

                        {/* Eligibility */}
                        <div className="mb-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-primary-500" />
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              {getText(locale, 'Uyğunluq', 'Соответствие', 'Eligibility')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{eligibility}</p>
                        </div>

                        {/* Deadline and CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                          {scholarship.deadline && (
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              {getText(locale, 'Son tarix:', 'Срок:', 'Deadline:')}{' '}
                              {formatDeadline(scholarship.deadline, locale)}
                            </span>
                          </div>
                          )}
                          {!scholarship.deadline && <div />}
                          <Link href="/scholarships/apply">
                            <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                              {getText(locale, 'Müraciət et', 'Подать заявку', 'Apply')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {getText(locale, 'Necə Müraciət Etmək Olar?', 'Как подать заявку?', 'How to Apply?')}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: BookOpen,
                titleAz: 'Proqramı seçin',
                titleRu: 'Выберите программу',
                titleEn: 'Choose a program',
                descAz: 'Sizə uyğun təqaüd proqramını seçin',
                descRu: 'Выберите подходящую стипендию',
                descEn: 'Select the right scholarship for you',
              },
              {
                step: '02',
                icon: Users,
                titleAz: 'Formu doldurun',
                titleRu: 'Заполните форму',
                titleEn: 'Fill out the form',
                descAz: 'Müraciət formasını doldurun',
                descRu: 'Заполните форму заявки',
                descEn: 'Complete the application form',
              },
              {
                step: '03',
                icon: Clock,
                titleAz: 'Nəticəni gözləyin',
                titleRu: 'Ожидайте результат',
                titleEn: 'Wait for results',
                descAz: 'Komanda müraciətinizi araşdıracaq',
                descRu: 'Команда рассмотрит вашу заявку',
                descEn: 'Our team will review your application',
              },
              {
                step: '04',
                icon: Award,
                titleAz: 'Təhsilə başlayın',
                titleRu: 'Начните обучение',
                titleEn: 'Start learning',
                descAz: 'Təqaüd qazanın və təhsilə başlayın',
                descRu: 'Получите стипендию и начните обучение',
                descEn: 'Win the scholarship and start learning',
              },
            ].map((item, i) => {
              const StepIcon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="relative text-center p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800"
                >
                  <div className="text-5xl font-bold font-serif-heading text-primary-500/20 dark:text-primary-400/20 mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg mx-auto mb-4">
                    <StepIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {getText(locale, item.titleAz, item.titleRu, item.titleEn)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getText(locale, item.descAz, item.descRu, item.descEn)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-white mb-4">
              {getText(locale, 'Gələcəyinə investisiya qoy!', 'Инвестируй в своё будущее!', 'Invest in your future!')}
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              {getText(
                locale,
                'Təqaüd müraciətini indi göndər və karyerana addım at.',
                'Отправьте заявку на стипендию сейчас и сделайте шаг к карьере.',
                'Submit your scholarship application now and take a step towards your career.'
              )}
            </p>
            <Link href="/scholarships/apply">
              <Button variant="secondary" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {getText(locale, 'Müraciət et', 'Подать заявку', 'Apply Now')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
