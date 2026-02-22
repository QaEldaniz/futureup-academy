'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SITE_NAME, SOCIAL_LINKS } from '@/lib/constants';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Send,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface SiteSettings {
  phone?: string;
  email?: string;
  addressAz?: string;
  addressRu?: string;
  addressEn?: string;
  whatsapp?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  telegram?: string;
  [key: string]: string | undefined;
}

export function Footer() {
  const t = useTranslations('footer');
  const navT = useTranslations('nav');
  const locale = useLocale();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    api
      .get<{ success: boolean; data: SiteSettings }>('/settings')
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Get localized address
  const getAddress = () => {
    if (!settings) return t('address');
    const suffixMap: Record<string, string> = { az: 'Az', ru: 'Ru', en: 'En' };
    const suffix = suffixMap[locale] || 'Az';
    return settings[`address${suffix}`] || settings.addressAz || settings.addressEn || t('address');
  };

  const phone = settings?.phone || '+994 50 123 45 67';
  const email = settings?.email || 'info@futureup.az';
  const address = getAddress();

  // Social links from DB or fallback to constants
  const socialLinks = [
    { icon: Facebook, href: settings?.facebook || SOCIAL_LINKS.facebook },
    { icon: Instagram, href: settings?.instagram || SOCIAL_LINKS.instagram },
    { icon: Linkedin, href: settings?.linkedin || SOCIAL_LINKS.linkedin },
    { icon: Youtube, href: settings?.youtube || SOCIAL_LINKS.youtube },
    { icon: Send, href: settings?.telegram || SOCIAL_LINKS.telegram },
  ];

  const whatsapp = settings?.whatsapp;

  const quickLinks = [
    { href: '/courses', label: navT('courses') },
    { href: '/teachers', label: navT('teachers') },
    { href: '/scholarships', label: navT('scholarships') },
    { href: '/corporate', label: navT('corporate') },
    { href: '/about', label: navT('about') },
    { href: '/contact', label: navT('contact') },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/images/logo.png" alt="FutureUp Academy" width={44} height={44} />
              <div>
                <span className="text-xl font-extrabold text-white">FutureUp</span>
                <span className="text-xs block text-gray-400 -mt-0.5 tracking-wider uppercase">
                  Academy
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('description')}
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors group"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('programs')}
            </h3>
            <ul className="space-y-2.5">
              {['Frontend Development', 'Backend Development', 'UI/UX Design', 'Data Analytics', 'Cyber Security', 'Digital Marketing'].map(
                (program) => (
                  <li key={program}>
                    <Link
                      href="/courses"
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {program}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('contact')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <a href={`tel:${phone}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <a href={`mailto:${email}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">{address}</span>
              </li>
              {whatsapp && (
                <li className="flex items-start gap-3">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-400 fill-current mt-0.5 shrink-0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9+]/g, '').replace('+', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-400 text-sm transition-colors"
                  >
                    {whatsapp}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {SITE_NAME}. {t('rights')}
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/faq" className="text-gray-500 hover:text-gray-300 transition-colors">
              {t('privacy')}
            </Link>
            <Link href="/faq" className="text-gray-500 hover:text-gray-300 transition-colors">
              {t('terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
