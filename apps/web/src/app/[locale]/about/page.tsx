'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Lightbulb, Users, Globe, Wrench, TrendingUp, Sparkles, Target, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const values = [
  { icon: Award, key: 'value1', gradient: 'from-primary-500 to-secondary-500' },
  { icon: Lightbulb, key: 'value2', gradient: 'from-accent-500 to-primary-500' },
  { icon: Users, key: 'value3', gradient: 'from-secondary-500 to-secondary-600' },
  { icon: Globe, key: 'value4', gradient: 'from-primary-400 to-primary-600' },
  { icon: Wrench, key: 'value5', gradient: 'from-orange-500 to-amber-500' },
  { icon: TrendingUp, key: 'value6', gradient: 'from-pink-500 to-rose-500' },
];

interface PublicStats {
  totalCourses: number;
  totalStudents: number;
  totalTeachers: number;
  totalCertificates: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AboutPage() {
  const t = useTranslations('about');
  const statsT = useTranslations('home');
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: PublicStats }>('/admin/dashboard/public-stats')
      .then((res) => {
        if (res.success) setPublicStats(res.data);
      })
      .catch(() => {
        // Will use fallback values
      });
  }, []);

  const stats = [
    { value: publicStats ? `${publicStats.totalStudents}+` : '500+', labelKey: 'students' },
    { value: publicStats ? `${publicStats.totalCourses}+` : '15+', labelKey: 'courses' },
    { value: '92%', labelKey: 'employment' },
    { value: publicStats ? `${publicStats.totalTeachers}+` : '20+', labelKey: 'teachers' },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden bg-bg-light dark:bg-bg-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 mb-8">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Academy</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-heading text-gray-900 dark:text-white mb-6">{t('title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Story with image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('storyTitle')}</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{t('storyText')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src="/images/students-learning.jpg"
                  alt="Students learning together"
                  className="w-full h-[320px] object-cover"
                />
              </div>
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 opacity-20 blur-xl" />
            </motion.div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-8 rounded-lg bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-900/20 dark:to-primary-900/10 border border-primary-200/50 dark:border-primary-700/30">
              <Target className="w-10 h-10 text-primary-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('missionTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('missionText')}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-8 rounded-lg bg-gradient-to-br from-accent-50 to-accent-100/50 dark:from-accent-900/20 dark:to-accent-900/10 border border-accent-200/50 dark:border-accent-700/30">
              <Eye className="w-10 h-10 text-accent-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{t('visionTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('visionText')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">{t('statsTitle')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                <p className="text-4xl font-bold font-serif-heading text-primary-500 dark:text-primary-400 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{statsT(`stats.${stat.labelKey}`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">{t('valuesTitle')}</h2>
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <motion.div key={value.key} variants={itemVariants} className="p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg mb-4', value.gradient)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t(value.key)}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{t(`${value.key}Desc`)}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-lg text-primary-100 mb-8">{t('ctaSubtitle')}</p>
          <Link href="/apply">
            <Button variant="secondary" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>{t('ctaButton')}</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
