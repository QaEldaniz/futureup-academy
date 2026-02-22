'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { QrCode, Search, FileCheck2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from '@/i18n/routing';

export default function CertificateSearchPage() {
  const t = useTranslations('certificate');
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      router.push(`/certificate/${code.trim()}`);
    }
  };

  const steps = [
    { icon: QrCode, text: t('howStep1') },
    { icon: Search, text: t('howStep2') },
    { icon: FileCheck2, text: t('howStep3') },
  ];

  return (
    <>
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden bg-bg-light dark:bg-bg-dark">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 mb-8">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Academy</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl font-bold font-serif-heading text-gray-900 dark:text-white mb-6">{t('searchTitle')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-gray-600 dark:text-gray-400 mb-10">{t('searchSubtitle')}</motion.p>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} onSubmit={handleSearch} className="flex gap-3 max-w-lg mx-auto">
            <input type="text" placeholder={t('enterCode')} value={code} onChange={(e) => setCode(e.target.value)} required
              className="flex-1 px-6 py-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
            <Button type="submit" size="xl">{t('searchButton')}</Button>
          </motion.form>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-12">{t('howItWorks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{i + 1}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{step.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
