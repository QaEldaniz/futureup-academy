'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Linkedin, Github, BookOpen, Users, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Teacher {
  id: number;
  initials: string;
  nameKey: string;
  roleKey: string;
  gradient: string;
  experience: number;
  courseCount: number;
  studentCount: number;
}

const teachers: Teacher[] = [
  { id: 1, initials: 'EH', nameKey: 'teacher1Name', roleKey: 'teacher1Role', gradient: 'from-primary-500 to-secondary-600', experience: 8, courseCount: 5, studentCount: 120 },
  { id: 2, initials: 'LA', nameKey: 'teacher2Name', roleKey: 'teacher2Role', gradient: 'from-accent-500 to-secondary-500', experience: 6, courseCount: 4, studentCount: 95 },
  { id: 3, initials: 'OM', nameKey: 'teacher3Name', roleKey: 'teacher3Role', gradient: 'from-pink-500 to-primary-500', experience: 10, courseCount: 6, studentCount: 150 },
  { id: 4, initials: 'NR', nameKey: 'teacher4Name', roleKey: 'teacher4Role', gradient: 'from-green-500 to-accent-500', experience: 5, courseCount: 3, studentCount: 80 },
  { id: 5, initials: 'TQ', nameKey: 'teacher5Name', roleKey: 'teacher5Role', gradient: 'from-orange-500 to-amber-500', experience: 7, courseCount: 4, studentCount: 110 },
  { id: 6, initials: 'SM', nameKey: 'teacher6Name', roleKey: 'teacher6Role', gradient: 'from-secondary-500 to-primary-600', experience: 9, courseCount: 5, studentCount: 130 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function TeacherCard({ teacher }: { teacher: Teacher }) {
  const t = useTranslations('teachersPage');

  return (
    <motion.div variants={cardVariants} className={cn(
      'group relative overflow-hidden rounded-2xl',
      'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800',
      'hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-2',
      'transition-all duration-500'
    )}>
      <div className="relative h-56 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(108,60,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className={cn('absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20 bg-gradient-to-br group-hover:opacity-30 transition-opacity duration-500', teacher.gradient)} />
        <div className={cn('relative w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br shadow-xl group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/20', teacher.gradient)}>
          <span className="text-3xl font-bold text-white tracking-wider">{teacher.initials}</span>
        </div>
        <div className="absolute inset-0 flex items-end justify-center pb-4 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2">
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"><Linkedin className="w-4 h-4 text-white" /></a>
            <a href="#" className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"><Github className="w-4 h-4 text-white" /></a>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{t(teacher.nameKey)}</h3>
        <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-4">{t(teacher.roleKey)}</p>
        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">{teacher.experience} {t('years')}</span></div>
          <div className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">{teacher.courseCount} {t('courses')}</span></div>
          <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400" /><span className="text-xs text-gray-500">{teacher.studentCount}+</span></div>
        </div>
      </div>
      <div className={cn('absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300', teacher.gradient)} />
    </motion.div>
  );
}

export default function TeachersPage() {
  const t = useTranslations('teachersPage');

  return (
    <>
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden bg-bg-light dark:bg-bg-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(108,60,225,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(108,60,225,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 mb-8">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Academy</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">{t('title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</motion.p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((teacher) => <TeacherCard key={teacher.id} teacher={teacher} />)}
          </motion.div>
        </div>
      </section>
    </>
  );
}
