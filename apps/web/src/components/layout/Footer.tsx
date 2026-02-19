'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { SITE_NAME, SOCIAL_LINKS, CONTACT } from '@/lib/constants';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Send,
} from 'lucide-react';

export function Footer() {
  const t = useTranslations('footer');
  const navT = useTranslations('nav');

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
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
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
              {[
                { icon: Facebook, href: SOCIAL_LINKS.facebook },
                { icon: Instagram, href: SOCIAL_LINKS.instagram },
                { icon: Linkedin, href: SOCIAL_LINKS.linkedin },
                { icon: Youtube, href: SOCIAL_LINKS.youtube },
                { icon: Send, href: SOCIAL_LINKS.telegram },
              ].map(({ icon: Icon, href }, i) => (
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
                <a href={`tel:${CONTACT.phone}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <a href={`mailto:${CONTACT.email}`} className="text-gray-400 hover:text-white text-sm transition-colors">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">{t('address')}</span>
              </li>
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
