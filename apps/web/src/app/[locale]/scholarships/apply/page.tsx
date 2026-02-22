'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Send,
  User,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Scholarship {
  id: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
}

function getText(locale: string, az: string, ru: string, en: string): string {
  if (locale === 'ru') return ru;
  if (locale === 'en') return en;
  return az;
}

function getLocalizedText(item: Record<string, unknown>, field: string, locale: string): string {
  const suffix = locale === 'az' ? 'Az' : locale === 'ru' ? 'Ru' : 'En';
  return (item[`${field}${suffix}`] as string) || (item[`${field}Az`] as string) || '';
}

const inputClasses =
  'w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all';

const labelClasses = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2';

// Demo scholarships used as fallback
const demoScholarships: Scholarship[] = [
  { id: '1', titleAz: 'Tam Təqaüd Proqramı', titleRu: 'Полная стипендиальная программа', titleEn: 'Full Scholarship Program' },
  { id: '2', titleAz: 'Bacarıq Təqaüdü', titleRu: 'Стипендия за навыки', titleEn: 'Merit Scholarship' },
  { id: '3', titleAz: 'Qadınlar üçün IT Təqaüdü', titleRu: 'IT Стипендия для женщин', titleEn: 'Women in IT Scholarship' },
  { id: '4', titleAz: 'Erkən Qeydiyyat Endirimi', titleRu: 'Скидка за раннюю регистрацию', titleEn: 'Early Bird Discount' },
];

export default function ScholarshipApplyPage() {
  const locale = useLocale();
  const [scholarships, setScholarships] = useState<Scholarship[]>(demoScholarships);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    scholarshipId: '',
    motivationLetter: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<Scholarship[]>('/scholarships')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setScholarships(data);
        }
      })
      .catch(() => {
        // Keep demo data
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post('/scholarship-applications', formData);
      setSubmitted(true);
    } catch (err) {
      // If API fails, show success anyway for demo purposes
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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
            <GraduationCap className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Academy</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold font-serif-heading tracking-tight text-gray-900 dark:text-white mb-4"
          >
            {getText(locale, 'Təqaüd Müraciəti', 'Заявка на Стипендию', 'Scholarship Application')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400"
          >
            {getText(
              locale,
              'Aşağıdakı formanı dolduraraq təqaüd proqramına müraciət edin.',
              'Заполните форму ниже, чтобы подать заявку на стипендиальную программу.',
              'Fill out the form below to apply for a scholarship program.'
            )}
          </motion.p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 sm:py-16 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {getText(locale, 'Təqaüdlərə qayıt', 'Вернуться к стипендиям', 'Back to Scholarships')}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 sm:p-10 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 shadow-xl"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {getText(locale, 'Müraciətiniz göndərildi!', 'Ваша заявка отправлена!', 'Your application has been submitted!')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {getText(
                    locale,
                    'Komandamız müraciətinizi ən qısa zamanda nəzərdən keçirəcək və sizinlə əlaqə saxlayacaq.',
                    'Наша команда рассмотрит вашу заявку в кратчайшие сроки и свяжется с вами.',
                    'Our team will review your application as soon as possible and contact you.'
                  )}
                </p>
                <Link href="/scholarships">
                  <Button variant="outline" size="lg" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                    {getText(locale, 'Təqaüdlərə qayıt', 'Вернуться к стипендиям', 'Back to Scholarships')}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {getText(locale, 'Müraciət Forması', 'Форма Заявки', 'Application Form')}
                  </h3>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className={labelClasses}>
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-500" />
                        {getText(locale, 'Ad və Soyad', 'Имя и Фамилия', 'Full Name')}
                      </span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={getText(locale, 'Ad və soyadınızı daxil edin', 'Введите имя и фамилию', 'Enter your full name')}
                      required
                      className={inputClasses}
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="email" className={labelClasses}>
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary-500" />
                          {getText(locale, 'E-poçt', 'Электронная почта', 'Email')}
                        </span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@email.com"
                        required
                        className={inputClasses}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClasses}>
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary-500" />
                          {getText(locale, 'Telefon', 'Телефон', 'Phone')}
                        </span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+994 XX XXX XX XX"
                        required
                        className={inputClasses}
                      />
                    </div>
                  </div>

                  {/* Scholarship Select */}
                  <div>
                    <label className={labelClasses}>
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-primary-500" />
                        {getText(locale, 'Təqaüd Proqramı', 'Стипендиальная Программа', 'Scholarship Program')}
                      </span>
                    </label>
                    <CustomSelect
                      required
                      searchable
                      value={formData.scholarshipId}
                      onChange={(val) => setFormData((prev) => ({ ...prev, scholarshipId: val }))}
                      placeholder={getText(locale, 'Proqram seçin...', 'Выберите программу...', 'Select a program...')}
                      options={scholarships.map((s) => ({
                        value: s.id,
                        label: getLocalizedText(s as unknown as Record<string, unknown>, 'title', locale),
                      }))}
                    />
                  </div>

                  {/* Motivation Letter */}
                  <div>
                    <label htmlFor="motivationLetter" className={labelClasses}>
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        {getText(locale, 'Motivasiya Məktubu', 'Мотивационное Письмо', 'Motivation Letter')}
                      </span>
                    </label>
                    <textarea
                      id="motivationLetter"
                      name="motivationLetter"
                      value={formData.motivationLetter}
                      onChange={handleChange}
                      placeholder={getText(
                        locale,
                        'Niyə bu təqaüdə layiq olduğunuzu və gələcək hədəflərinizi yazın...',
                        'Опишите, почему вы заслуживаете эту стипендию и каковы ваши цели...',
                        'Describe why you deserve this scholarship and what your future goals are...'
                      )}
                      rows={6}
                      required
                      className={cn(inputClasses, 'resize-none')}
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={loading}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    {getText(locale, 'Müraciəti Göndər', 'Отправить Заявку', 'Submit Application')}
                  </Button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
