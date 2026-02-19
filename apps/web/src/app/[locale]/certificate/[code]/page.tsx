'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { CheckCircle2, Download, Calendar, User, BookOpen, Award, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface CertificateData {
  id: string;
  uniqueCode: string;
  issueDate: string;
  grade?: string;
  teacherReview?: string;
  pdfUrl?: string;
  status: string;
  student: {
    id: string;
    name: string;
    photo?: string;
  };
  course: {
    id: string;
    slug: string;
    titleAz: string;
    titleRu: string;
    titleEn: string;
  };
  teacher: {
    id: string;
    nameAz: string;
    nameRu: string;
    nameEn: string;
    photo?: string;
  };
}

export default function CertificateVerifyPage() {
  const t = useTranslations('certificate');
  const params = useParams();
  const code = params.code as string;
  const locale = (params.locale as string) || 'az';

  const [cert, setCert] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCertificate() {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: CertificateData }>(
          `/certificates/verify/${code}`
        );
        if (res.success && res.data) {
          setCert(res.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to verify certificate:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    if (code) {
      fetchCertificate();
    }
  }, [code]);

  const getCourseName = (c: CertificateData) => {
    if (locale === 'ru') return c.course.titleRu || c.course.titleEn;
    if (locale === 'en') return c.course.titleEn || c.course.titleAz;
    return c.course.titleAz || c.course.titleEn;
  };

  const getTeacherName = (c: CertificateData) => {
    if (locale === 'ru') return c.teacher.nameRu || c.teacher.nameEn;
    if (locale === 'en') return c.teacher.nameEn || c.teacher.nameAz;
    return c.teacher.nameAz || c.teacher.nameEn;
  };

  // Loading state
  if (loading) {
    return (
      <section className="min-h-screen pt-32 pb-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Loader2 className="w-12 h-12 text-primary-500 mx-auto animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('verifying') || 'Verifying certificate...'}</p>
        </div>
      </section>
    );
  }

  // Not found
  if (error || !cert) {
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
                    <p className="font-semibold text-gray-900 dark:text-white">{cert.student.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('course')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{getCourseName(cert)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('completionDate')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(cert.issueDate).toLocaleDateString(
                        locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-US' : 'az-AZ',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </p>
                  </div>
                </div>
                {cert.grade && (
                  <div className="flex items-start gap-3">
                    <Star className="w-5 h-5 text-primary-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('grade')}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{cert.grade}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('instructor')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{getTeacherName(cert)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{t('certificateNumber')}</p>
                    <p className="font-semibold text-gray-900 dark:text-white font-mono">{cert.uniqueCode}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Review */}
              {cert.teacherReview && (
                <div className="p-5 rounded-xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30">
                  <p className="text-xs text-primary-500 uppercase tracking-wide mb-2">{t('review')}</p>
                  <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">&ldquo;{cert.teacherReview}&rdquo;</p>
                </div>
              )}

              {/* Download */}
              {cert.pdfUrl && (
                <div className="text-center pt-4">
                  <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" rightIcon={<Download className="w-4 h-4" />}>{t('downloadPdf')}</Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
