'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface SiteSettings {
  phone?: string;
  email?: string;
  addressAz?: string;
  addressRu?: string;
  addressEn?: string;
  whatsapp?: string;
  workingHoursAz?: string;
  workingHoursRu?: string;
  workingHoursEn?: string;
  googleMapsEmbed?: string;
  googleMapsLink?: string;
  [key: string]: string | undefined;
}

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [settings, setSettings] = useState<SiteSettings>({});
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    api
      .get<{ success: boolean; data: SiteSettings }>('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setSettingsLoaded(true));
  }, []);

  // Get localized fields
  const getLocalized = (field: string, fallback: string) => {
    const suffixMap: Record<string, string> = { az: 'Az', ru: 'Ru', en: 'En' };
    const suffix = suffixMap[locale] || 'Az';
    return settings[`${field}${suffix}`] || settings[`${field}Az`] || settings[`${field}En`] || fallback;
  };

  const address = getLocalized('address', t('addressText'));
  const workingHours = getLocalized('workingHours', t('workingHoursText'));
  const phoneNumber = settings.phone || t('phoneText');
  const emailAddress = settings.email || t('emailText');
  const whatsappNumber = settings.whatsapp;
  const mapsEmbed = settings.googleMapsEmbed;
  const mapsLink = settings.googleMapsLink;

  const contactCards: { icon: React.ElementType; title: string; text: string; gradient: string; href?: string }[] = [
    {
      icon: MapPin,
      title: t('addressTitle'),
      text: address,
      gradient: 'from-primary-500 to-secondary-500',
      href: mapsLink || undefined,
    },
    {
      icon: Phone,
      title: t('phoneTitle'),
      text: phoneNumber,
      gradient: 'from-accent-500 to-primary-500',
      href: `tel:${phoneNumber}`,
    },
    {
      icon: Mail,
      title: t('emailTitle'),
      text: emailAddress,
      gradient: 'from-green-500 to-accent-500',
      href: `mailto:${emailAddress}`,
    },
  ];

  // WhatsApp card if configured
  if (whatsappNumber) {
    const cleanNum = whatsappNumber.replace(/[^0-9+]/g, '').replace('+', '');
    contactCards.push({
      icon: () => (
        <svg viewBox="0 0 24 24" className="w-7 h-7 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      title: 'WhatsApp',
      text: whatsappNumber,
      gradient: 'from-[#25D366] to-[#128C7E]',
      href: `https://wa.me/${cleanNum}`,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/applications', {
        name: form.name,
        email: form.email,
        phone: form.phone || '-',
        message: form.subject ? `[${form.subject}] ${form.message}` : form.message,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
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
          <div className={cn(
            'grid gap-6 mb-16',
            contactCards.length === 4
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-3'
          )}>
            {contactCards.map((card, i) => {
              const Icon = card.icon;
              const Wrapper = card.href ? 'a' : 'div';
              const wrapperProps = card.href
                ? { href: card.href, target: card.href.startsWith('http') ? '_blank' : undefined, rel: card.href.startsWith('http') ? 'noopener noreferrer' : undefined }
                : {};
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Wrapper
                    {...wrapperProps as any}
                    className={cn(
                      'block text-center p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
                      card.href && 'cursor-pointer'
                    )}
                  >
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg mx-auto mb-4', card.gradient)}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{card.text}</p>
                    {card.href && card.href.startsWith('http') && (
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 mx-auto mt-3" />
                    )}
                  </Wrapper>
                </motion.div>
              );
            })}
          </div>

          {/* Map + Working Hours + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Map + Working hours */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              {/* Google Maps Embed */}
              <div className="h-72 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
                {mapsEmbed ? (
                  <iframe
                    src={mapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/20 dark:to-secondary-900/20 flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-primary-400" />
                  </div>
                )}
              </div>

              {/* Working hours */}
              <div className="p-6 rounded-2xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary-500" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('workingHours')}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400">{workingHours}</p>
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
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">{error}</div>
                    )}
                    <input type="text" placeholder={t('name')} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input type="email" placeholder={t('email')} required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                      <input type="tel" placeholder={t('phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                    </div>
                    <input type="text" placeholder={t('subject')} required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50" />
                    <textarea placeholder={t('message')} rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" />
                    <Button type="submit" className="w-full" size="lg" disabled={loading} rightIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}>{loading ? '...' : t('send')}</Button>
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
