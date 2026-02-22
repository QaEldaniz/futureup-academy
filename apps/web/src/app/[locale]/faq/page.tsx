'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { ChevronDown, Search, ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const faqItems = [
  { qKey: 'q1', aKey: 'a1', category: 'general' },
  { qKey: 'q2', aKey: 'a2', category: 'general' },
  { qKey: 'q3', aKey: 'a3', category: 'coursesFaq' },
  { qKey: 'q4', aKey: 'a4', category: 'certificateFaq' },
  { qKey: 'q5', aKey: 'a5', category: 'coursesFaq' },
  { qKey: 'q6', aKey: 'a6', category: 'payment' },
  { qKey: 'q7', aKey: 'a7', category: 'general' },
  { qKey: 'q8', aKey: 'a8', category: 'coursesFaq' },
];

const categories = ['general', 'coursesFaq', 'payment', 'certificateFaq'];

function AccordionItem({ qKey, aKey, isOpen, onToggle }: { qKey: string; aKey: string; isOpen: boolean; onToggle: () => void }) {
  const t = useTranslations('faq');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 bg-white dark:bg-surface-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left">
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{t(qKey)}</span>
        <ChevronDown className={cn('w-5 h-5 text-gray-400 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>
      {isOpen && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} transition={{ duration: 0.2 }} className="px-5 pb-5 bg-gray-50/50 dark:bg-gray-900/20">
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t(aKey)}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');

  const filteredFaqs = faqItems.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    if (searchQuery) {
      return matchesCategory;
    }
    return matchesCategory;
  });

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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">{t('title')}</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8">{t('subtitle')}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder={t('search')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setOpenIndex(0); }}
                className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                  activeCategory === cat ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300')}>
                {t(cat)}
              </button>
            ))}
          </div>

          {/* FAQ items */}
          <div className="space-y-3">
            {filteredFaqs.map((item, i) => (
              <AccordionItem key={item.qKey} qKey={item.qKey} aKey={item.aKey} isOpen={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <MessageCircle className="w-12 h-12 text-primary-200 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-lg text-primary-100 mb-8">{t('ctaSubtitle')}</p>
          <Link href="/contact">
            <Button variant="secondary" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>{t('ctaButton')}</Button>
          </Link>
        </div>
      </section>
    </>
  );
}
