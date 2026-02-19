'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);

  const contactCards = [
    { icon: MapPin, title: t('addressTitle'), text: t('addressText'), gradient: 'from-primary-500 to-secondary-500' },
    { icon: Phone, title: t('phoneTitle'), text: t('phoneText'), gradient: 'from-accent-500 to-primary-500' },
    { icon: Mail, title: t('emailTitle'), text: t('emailText'), gradient: 'from-green-500 to-accent-500' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      {/* Hero */}
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">{t('title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">{t('subtitle')}</motion.p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="text-center p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg mx-auto mb-4', card.gradient)}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{card.text}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Working Hours + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map placeholder + Working hours */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="h-64 rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6">
                <MapPin className="w-12 h-12 text-primary-400" />
              </div>
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('workingHours')}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">{t('workingHoursText')}</p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('formTitle')}</h3>
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">{t('success')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder={t('name')} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="email" placeholder={t('email')} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                      <input type="tel" placeholder={t('phone')} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                    </div>
                    <input type="text" placeholder={t('subject')} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                    <textarea placeholder={t('message')} rows={4} required className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
                    <Button type="submit" className="w-full" size="lg" rightIcon={<Send className="w-4 h-4" />}>{t('send')}</Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
