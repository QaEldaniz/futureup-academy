'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Sparkles, ChevronLeft, ChevronRight, Loader2, Inbox, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface NewsArticle {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  excerptAz?: string;
  excerptRu?: string;
  excerptEn?: string;
  image?: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const gradients = [
  'from-primary-500 to-secondary-600',
  'from-accent-500 to-primary-600',
  'from-secondary-500 to-accent-600',
  'from-primary-600 to-accent-500',
  'from-accent-600 to-secondary-500',
  'from-secondary-600 to-primary-500',
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
  const locale = useLocale();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 9;

  useEffect(() => {
    fetchNews();
  }, [page]);

  async function fetchNews() {
    try {
      setLoading(true);
      const res = await api.get<{
        success: boolean;
        data: NewsArticle[];
        total: number;
        totalPages: number;
      }>(`/news?page=${page}&limit=${limit}`);
      if (res.success) {
        setArticles(res.data);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  }

  const getTitle = (a: NewsArticle) => {
    if (locale === 'ru') return a.titleRu || a.titleEn;
    if (locale === 'en') return a.titleEn || a.titleAz;
    return a.titleAz || a.titleEn;
  };

  const getExcerpt = (a: NewsArticle) => {
    if (locale === 'ru') return a.excerptRu || a.excerptEn || '';
    if (locale === 'en') return a.excerptEn || a.excerptAz || '';
    return a.excerptAz || a.excerptEn || '';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'az-AZ',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
            {t('title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-16 sm:py-24 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                {locale === 'ru' ? 'Новостей пока нет' : locale === 'en' ? 'No news yet' : 'Hələ xəbər yoxdur'}
              </p>
            </div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {articles.map((article, idx) => (
                  <motion.div key={article.id} variants={itemVariants} className="group">
                    <Link href={`/news/${article.slug}`}>
                      <div className="bg-white dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        {article.image ? (
                          <div className="h-48 overflow-hidden">
                            <img
                              src={article.image}
                              alt={getTitle(article)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className={cn('h-48 bg-gradient-to-br relative overflow-hidden', gradients[idx % gradients.length])}>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:32px_32px]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Newspaper className="w-8 h-8 text-white" />
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {getTitle(article)}
                          </h3>
                          {getExcerpt(article) && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                              {getExcerpt(article)}
                            </p>
                          )}
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2.5 transition-all">
                            {t('readMore')} <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {locale === 'ru' ? 'Назад' : locale === 'en' ? 'Prev' : 'Geri'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    {locale === 'ru' ? 'Вперёд' : locale === 'en' ? 'Next' : 'İrəli'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
