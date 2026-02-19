'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Calendar, User, BookOpen, Award, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

const demoCertificates: Record<string, { student: string; course: string; date: string; grade: string; instructor: string; review: string; number: string }> = {
  'CERT-2025-001': {
    student: 'Fərid Əhmədov', course: 'Frontend Development', date: '2025-01-15', grade: 'A+',
    instructor: 'Eldar Həsənov', review: 'Fərid kursu əla nəticə ilə tamamladı. Məsuliyyətli və yaradıcı tələbədir.',
    number: 'CERT-2025-001',
  },
  'CERT-2025-002': {
    student: 'Günel Hüseynova', course: 'UI/UX Design', date: '2025-01-20', grade: 'A',
    instructor: 'Leyla Əliyeva', review: 'Günel dizayn prinsiplərini mükəmməl öyrəndi.',
    number: 'CERT-2025-002',
  },
};

export default function CertificateVerifyPage() {
  const t = useTranslations('certificate');
  const params = useParams();
  const code = params.code as string;
  const cert = demoCertificates[code];

  if (!cert) {
    return (
      <section className="min-h-screen pt-32 pb-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">{t('notFound')}</h1>
            <p className="text-gray-500 dark:text-gray-400">{t('notFoundDesc')}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen pt-32 pb-16 bg-bg-light dark:bg-bg-dark">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Verified Badge */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">{t('verified')}</h1>
          </div>

          {/* Certificate Card */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            {/* Header gradient */}
            <div className="h-3 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500" />

            <div className="p-8 space-y-6">
              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('student')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.student}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('course')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.course}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('completionDate')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('grade')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.grade}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('instructor')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.instructor}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('certificateNumber')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.number}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Review */}
              <div className="p-5 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30">
                <p className="text-xs text-primary-500 uppercase tracking-wide mb-2">{t('review')}</p>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">&ldquo;{cert.review}&rdquo;</p>
              </div>

              {/* Download */}
              <div className="text-center pt-4">
                <Button size="lg" rightIcon={<Download className="w-4 h-4" />}>{t('downloadPdf')}</Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
