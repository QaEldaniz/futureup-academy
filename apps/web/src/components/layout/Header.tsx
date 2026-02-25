'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Header() {
  const t = useTranslations('nav');
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navLinks = [
    { href: '/courses', label: t('courses') },
    { href: '/teachers', label: t('teachers') },
    { href: '/scholarships', label: t('scholarships') },
    { href: '/corporate', label: t('corporate') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-surface-light/95 dark:bg-bg-dark/95 backdrop-blur-sm shadow-sm border-b border-secondary-200/30 dark:border-secondary-800/30'
          : 'bg-transparent'
      )}
    >
      {/* Classical gold accent bar — inspired by British university tradition */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-secondary-500 to-transparent" />

      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/images/logo.png" alt="FutureUp Academy" width={64} height={64} unoptimized className="group-hover:scale-105 transition-transform dark:brightness-0 dark:invert" />
            <div className="flex flex-col">
              <span className="text-xl font-bold font-serif-heading text-primary-500 dark:text-white">
                FutureUp
              </span>
              <span className="text-[10px] font-medium text-secondary-500 dark:text-secondary-400 -mt-1 tracking-[0.2em] uppercase">
                Academy
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium tracking-wide text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors border-b-2 border-transparent hover:border-secondary-500"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <a
              href="/login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <LogIn className="w-4 h-4" />
              {t('login')}
            </a>
            <Link href="/contact" className="hidden sm:block">
              <Button size="sm">{t('apply')}</Button>
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-bg-dark border-b border-gray-200 dark:border-gray-700 shadow-lg pb-4">
            <div className="flex flex-col gap-1 pt-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors"
              >
                <LogIn className="w-5 h-5" />
                {t('login')}
              </a>
              <Link href="/contact" onClick={() => setIsOpen(false)} className="mt-2 px-4">
                <Button size="lg" className="w-full">
                  {t('apply')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
