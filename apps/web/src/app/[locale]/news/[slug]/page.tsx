'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { Calendar, ArrowLeft, Loader2, Newspaper } from 'lucide-react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface NewsArticle {
  id: string;
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  contentAz: string;
  contentRu: string;
  contentEn: string;
  excerptAz?: string;
  excerptRu?: string;
  excerptEn?: string;
  image?: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export default function NewsDetailPage() {
  const t = useTranslations('news');
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) fetchArticle();
  }, [slug]);

  async function fetchArticle() {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: NewsArticle }>(`/news/${slug}`);
      if (res.success) {
        setArticle(res.data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  const getTitle = (a: NewsArticle) => {
    if (locale === 'ru') return a.titleRu || a.titleEn;
    if (locale === 'en') return a.titleEn || a.titleAz;
    return a.titleAz || a.titleEn;
  };

  const getContent = (a: NewsArticle) => {
    if (locale === 'ru') return a.contentRu || a.contentEn;
    if (locale === 'en') return a.contentEn || a.contentAz;
    return a.contentAz || a.contentEn;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(
      locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'az-AZ',
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light dark:bg-bg-dark px-4">
        <Newspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {locale === 'ru' ? 'Статья не найдена' : locale === 'en' ? 'Article not found' : 'Məqalə tapılmadı'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {locale === 'ru' ? 'Эта статья не существует или была удалена' : locale === 'en' ? 'This article does not exist or has been removed' : 'Bu məqalə mövcud deyil və ya silinib'}
        </p>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {locale === 'ru' ? 'Все новости' : locale === 'en' ? 'All news' : 'Bütün xəbərlər'}
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden bg-bg-light dark:bg-bg-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'ru' ? 'Все новости' : locale === 'en' ? 'All news' : 'Bütün xəbərlər'}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight"
          >
            {getTitle(article)}
          </motion.h1>
        </div>
      </section>

      {/* Image */}
      {article.image && (
        <section className="bg-bg-light dark:bg-bg-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-2xl overflow-hidden"
            >
              <img
                src={article.image}
                alt={getTitle(article)}
                className="w-full h-auto max-h-[500px] object-cover"
              />
            </motion.div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 sm:py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-lg dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-primary-600 dark:prose-a:text-primary-400
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: getContent(article) }}
          />

          {/* Back link */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === 'ru' ? 'Вернуться к новостям' : locale === 'en' ? 'Back to news' : 'Xəbərlərə qayıt'}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
