'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Tag, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const demoNews = [
  { slug: 'new-frontend-course-launch', gradient: 'from-primary-500 to-secondary-600', date: '2025-01-15', category: 'courses', titleKey: 'article1Title', excerptKey: 'article1Excerpt' },
  { slug: 'partnership-with-tech-companies', gradient: 'from-accent-500 to-primary-600', date: '2025-01-10', category: 'partnership', titleKey: 'article2Title', excerptKey: 'article2Excerpt' },
  { slug: 'student-success-story', gradient: 'from-secondary-500 to-accent-600', date: '2025-01-05', category: 'success', titleKey: 'article3Title', excerptKey: 'article3Excerpt' },
  { slug: 'cybersecurity-workshop', gradient: 'from-primary-600 to-accent-500', date: '2024-12-28', category: 'events', titleKey: 'article4Title', excerptKey: 'article4Excerpt' },
  { slug: 'new-campus-opening', gradient: 'from-accent-600 to-secondary-500', date: '2024-12-20', category: 'academy', titleKey: 'article5Title', excerptKey: 'article5Excerpt' },
  { slug: 'data-analytics-bootcamp', gradient: 'from-secondary-600 to-primary-500', date: '2024-12-15', category: 'courses', titleKey: 'article6Title', excerptKey: 'article6Excerpt' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function NewsPage() {
  const t = useTranslations('news');

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden bg-bg-light dark:bg-bg-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(108,60,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 mb-6">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{t('allNews')}</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">{t('title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</motion.p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 sm:py-24 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoNews.map((article) => (
              <motion.div key={article.slug} variants={itemVariants} className="group">
                <Link href={`/news/${article.slug}`}>
                  <div className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className={cn('h-48 bg-gradient-to-br relative overflow-hidden', article.gradient)}>
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                          <Sparkles className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500"><Calendar className="w-4 h-4" /><span>{article.date}</span></div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                          <Tag className="w-3 h-3" />{article.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">{t(article.titleKey)}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{t(article.excerptKey)}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2.5 transition-all">
                        {t('readMore')} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
