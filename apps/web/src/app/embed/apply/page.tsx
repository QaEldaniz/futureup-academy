'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const API_URL = (() => {
  let url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
  if (!url.endsWith('/api')) url += '/api';
  return url;
})();

interface Course {
  id: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
}

const LABELS: Record<string, Record<string, string>> = {
  az: {
    title: 'Qeydiyyat Forması',
    subtitle: 'Formu doldurun, 24 saat ərzində sizinlə əlaqə saxlayacağıq',
    name: 'Ad Soyad',
    namePlaceholder: 'Tam adınızı daxil edin',
    email: 'Email',
    emailPlaceholder: 'example@email.com',
    phone: 'Telefon',
    phonePlaceholder: '+994 XX XXX XX XX',
    course: 'Kurs seçin',
    message: 'Mesajınız',
    messagePlaceholder: 'Sual və ya mesajınızı yazın...',
    submit: 'Göndər',
    successTitle: 'Müraciətiniz qəbul edildi!',
    successDesc: '24 saat ərzində sizinlə əlaqə saxlayacağıq.',
    error: 'Xəta baş verdi. Yenidən cəhd edin.',
    poweredBy: 'FutureUp Academy tərəfindən',
  },
  ru: {
    title: 'Форма записи',
    subtitle: 'Заполните форму, мы свяжемся с вами в течение 24 часов',
    name: 'Полное имя',
    namePlaceholder: 'Введите ваше полное имя',
    email: 'Email',
    emailPlaceholder: 'example@email.com',
    phone: 'Телефон',
    phonePlaceholder: '+994 XX XXX XX XX',
    course: 'Выберите курс',
    message: 'Сообщение',
    messagePlaceholder: 'Напишите ваш вопрос или сообщение...',
    submit: 'Отправить',
    successTitle: 'Заявка отправлена!',
    successDesc: 'Мы свяжемся с вами в течение 24 часов.',
    error: 'Произошла ошибка. Попробуйте ещё раз.',
    poweredBy: 'При поддержке FutureUp Academy',
  },
  en: {
    title: 'Application Form',
    subtitle: "Fill out the form and we'll get back to you within 24 hours",
    name: 'Full Name',
    namePlaceholder: 'Enter your full name',
    email: 'Email',
    emailPlaceholder: 'example@email.com',
    phone: 'Phone',
    phonePlaceholder: '+994 XX XXX XX XX',
    course: 'Select a course',
    message: 'Message',
    messagePlaceholder: 'Write your question or message...',
    submit: 'Submit',
    successTitle: 'Application Submitted!',
    successDesc: "We'll contact you within 24 hours.",
    error: 'An error occurred. Please try again.',
    poweredBy: 'Powered by FutureUp Academy',
  },
};

function EmbedApplyForm() {
  const searchParams = useSearchParams();
  const lang = searchParams.get('lang') || 'az';
  const t = LABELS[lang] || LABELS.az;

  // UTM params
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const preselectedCourseId = searchParams.get('courseId') || '';

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    courseId: preselectedCourseId, message: '',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/courses?limit=50`)
      .then(r => r.json())
      .then(res => { if (res.success) setCourses(res.data); })
      .catch(() => {});
  }, []);

  const getCourseName = (c: Course) => {
    if (lang === 'ru') return c.titleRu || c.titleEn;
    if (lang === 'en') return c.titleEn || c.titleAz;
    return c.titleAz || c.titleEn;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload: any = {
      name: form.name,
      email: form.email,
      phone: form.phone,
    };
    if (form.courseId) payload.courseId = form.courseId;
    if (form.message) payload.message = form.message;
    if (utmSource) payload.utmSource = utmSource;
    if (utmMedium) payload.utmMedium = utmMedium;
    if (utmCampaign) payload.utmCampaign = utmCampaign;

    try {
      const res = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      // Notify parent iframe
      try {
        window.parent.postMessage({ type: 'futureup-apply-success', name: form.name }, '*');
      } catch {}
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h2>
          <p className="text-gray-500">{t.successDesc}</p>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-sm';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.name} *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t.namePlaceholder}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.email} *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={t.emailPlaceholder}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.phone} *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder={t.phonePlaceholder}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.course}</label>
            <select
              value={form.courseId}
              onChange={e => setForm({ ...form, courseId: e.target.value })}
              className={inputClass}
            >
              <option value="">{t.course}</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{getCourseName(c)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.message}</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder={t.messagePlaceholder}
              className={`${inputClass} resize-none`}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 transition-all text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {t.submit}
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          {t.poweredBy}
        </p>
      </div>
    </div>
  );
}

export default function EmbedApplyPage() {
  return (
    <Suspense>
      <EmbedApplyForm />
    </Suspense>
  );
}
