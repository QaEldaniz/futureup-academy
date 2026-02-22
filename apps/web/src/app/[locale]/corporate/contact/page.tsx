'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';
import {
  Building2,
  Send,
  ArrowLeft,
  CheckCircle2,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Briefcase,
  Loader2,
} from 'lucide-react';

function getText(locale: string, az: string, ru: string, en: string): string {
  if (locale === 'ru') return ru;
  if (locale === 'en') return en;
  return az;
}

interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  employeeCount: string;
  message: string;
}

const initialForm: FormData = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  employeeCount: '',
  message: '',
};

export default function CorporateContactPage() {
  const locale = useLocale();
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName.trim() || !form.contactName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError(getText(locale, 'Zəhmət olmasa bütün lazımi sahələri doldurun', 'Пожалуйста, заполните все обязательные поля', 'Please fill in all required fields'));
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await api.post('/corporate-inquiries', {
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        phone: form.phone,
        employeeCount: form.employeeCount ? parseInt(form.employeeCount) : undefined,
        message: form.message || undefined,
      });

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark min-h-[80vh] flex items-center justify-center pt-24 pb-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center max-w-lg mx-auto px-4"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-gradient-to-br from-secondary-500 to-accent-500 shadow-2xl mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            {getText(locale, 'Müraciətiniz göndərildi!', 'Ваша заявка отправлена!', 'Your inquiry has been sent!')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {getText(
              locale,
              'Komandamız tez zamanda sizinlə əlaqə saxlayacaq.',
              'Наша команда свяжется с вами в ближайшее время.',
              'Our team will get back to you shortly.'
            )}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/corporate">
              <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                {getText(locale, 'Korporativ səhifəyə qayıt', 'Вернуться', 'Back to Corporate')}
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg">
                {getText(locale, 'Ana səhifə', 'Главная', 'Home')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark pt-32 pb-12 sm:pt-40 sm:pb-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/30 mb-6"
          >
            <Building2 className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">B2B</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4"
          >
            {getText(locale, 'Bizimlə Əlaqə', 'Связаться с нами', 'Contact Us')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400"
          >
            {getText(
              locale,
              'Şirkətinizin ehtiyaclarını bizimlə bölüşün, biz sizin üçün ən uyğun həlli hazırlayaq.',
              'Поделитесь потребностями вашей компании, и мы подготовим для вас оптимальное решение.',
              'Share your company\'s needs and we\'ll prepare the optimal solution for you.'
            )}
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-2xl p-8 sm:p-10 shadow-xl"
          >
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Company Name */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Building2 className="w-4 h-4 text-primary-500" />
                  {getText(locale, 'Şirkət adı', 'Название компании', 'Company Name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder={getText(locale, 'Şirkətinizin adı', 'Название вашей компании', 'Your company name')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  required
                />
              </div>

              {/* Contact Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  {getText(locale, 'Əlaqə şəxsi', 'Контактное лицо', 'Contact Person')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => handleChange('contactName', e.target.value)}
                  placeholder={getText(locale, 'Ad Soyad', 'Имя Фамилия', 'Full Name')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  {getText(locale, 'E-poçt', 'Электронная почта', 'Email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@company.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  {getText(locale, 'Telefon', 'Телефон', 'Phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+994 50 123 45 67"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                  required
                />
              </div>

              {/* Employee Count */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Briefcase className="w-4 h-4 text-primary-500" />
                  {getText(locale, 'Əməkdaş sayı', 'Количество сотрудников', 'Number of Employees')}
                </label>
                <select
                  value={form.employeeCount}
                  onChange={(e) => handleChange('employeeCount', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">{getText(locale, 'Seçin', 'Выберите', 'Select')}</option>
                  <option value="10">1-10</option>
                  <option value="50">11-50</option>
                  <option value="100">51-100</option>
                  <option value="250">101-250</option>
                  <option value="500">251-500</option>
                  <option value="1000">500+</option>
                </select>
              </div>

              {/* Message */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary-500" />
                  {getText(locale, 'Mesaj', 'Сообщение', 'Message')}
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder={getText(
                    locale,
                    'Ehtiyaclarınız barədə qısa məlumat verin...',
                    'Расскажите коротко о ваших потребностях...',
                    'Tell us briefly about your needs...'
                  )}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
              <Button
                type="submit"
                size="xl"
                disabled={submitting}
                rightIcon={submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                className="w-full sm:w-auto"
              >
                {submitting
                  ? getText(locale, 'Göndərilir...', 'Отправка...', 'Sending...')
                  : getText(locale, 'Müraciəti göndər', 'Отправить заявку', 'Send Inquiry')}
              </Button>
              <Link href="/corporate">
                <span className="text-sm text-gray-500 hover:text-primary-500 transition-colors cursor-pointer">
                  {getText(locale, 'Geri qayıt', 'Вернуться назад', 'Go back')}
                </span>
              </Link>
            </div>
          </motion.form>
        </div>
      </section>
    </>
  );
}
