'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Linkedin, Github, Globe, BookOpen, Users, Sparkles, Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface Teacher {
  id: string;
  nameAz: string;
  nameRu: string;
  nameEn: string;
  bioAz?: string;
  bioRu?: string;
  bioEn?: string;
  photo?: string;
  specialization?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  isActive: boolean;
  courses?: { course: { id: string; titleAz: string; titleRu: string; titleEn: string } }[];
}

const gradients = [
  'from-primary-500 to-secondary-600',
  'from-accent-500 to-secondary-500',
  'from-pink-500 to-primary-500',
  'from-green-500 to-accent-500',
  'from-orange-500 to-amber-500',
  'from-secondary-500 to-primary-600',
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function TeacherCard({ teacher, index, locale }: { teacher: Teacher; index: number; locale: string }) {
  const t = useTranslations('teachersPage');
  const gradient = gradients[index % gradients.length];

  const getName = () => {
    if (locale === 'ru') return teacher.nameRu || teacher.nameEn;
    if (locale === 'en') return teacher.nameEn || teacher.nameAz;
    return teacher.nameAz || teacher.nameEn;
  };

  const getBio = () => {
    if (locale === 'ru') return teacher.bioRu || teacher.bioEn || '';
    if (locale === 'en') return teacher.bioEn || teacher.bioAz || '';
    return teacher.bioAz || teacher.bioEn || '';
  };

  const name = getName();
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const hasSocial = teacher.linkedin || teacher.github || teacher.website;

  return (
    <motion.div variants={cardVariants} className={cn(
      'group relative overflow-hidden rounded-lg',
      'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800',
      'hover:shadow-xl hover:-translate-y-2',
      'transition-all duration-500'
    )}>
      <div className="relative h-56 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className={cn('absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 bg-gradient-to-br group-hover:opacity-30 transition-opacity duration-500', gradient)} />

        {teacher.photo ? (
          <img
            src={teacher.photo}
            alt={name}
            className="relative w-28 h-28 rounded-full object-cover shadow-xl group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/50 dark:ring-gray-800/50"
          />
        ) : (
          <div className={cn('relative w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/20', gradient)}>
            <span className="text-3xl font-bold text-white tracking-wider">{initials}</span>
          </div>
        )}

        {hasSocial && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-2">
              {teacher.linkedin && (
                <a href={teacher.linkedin} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Linkedin className="w-4 h-4 text-white" />
                </a>
              )}
              {teacher.github && (
                <a href={teacher.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Github className="w-4 h-4 text-white" />
                </a>
              )}
              {teacher.website && (
                <a href={teacher.website} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <Globe className="w-4 h-4 text-white" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {name}
        </h3>
        {teacher.specialization && (
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-3">
            {teacher.specialization}
          </p>
        )}
        {getBio() && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
            {getBio()}
          </p>
        )}
        {teacher.courses && teacher.courses.length > 0 && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {teacher.courses.length} {t('courses')}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300', gradient)} />
    </motion.div>
  );
}

export default function TeachersPage() {
  const t = useTranslations('teachersPage');
  const locale = useLocale();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  async function fetchTeachers() {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: Teacher[] }>('/teachers?limit=50');
      if (res.success) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-heading text-gray-900 dark:text-white mb-6">
            {t('title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </motion.p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-20">
              <Inbox className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">
                {locale === 'ru' ? 'Преподаватели не найдены' : locale === 'en' ? 'No teachers found' : 'Müəllimlər tapılmadı'}
              </p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher, idx) => (
                <TeacherCard key={teacher.id} teacher={teacher} index={idx} locale={locale} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
