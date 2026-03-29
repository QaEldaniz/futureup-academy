'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowLeft, KeyRound, Mail, RefreshCw, Eye, EyeOff, Check } from 'lucide-react';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_URL = typeof window !== 'undefined' && RAW_API_URL.includes('localhost') ? '' : RAW_API_URL;

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword');

  const [step, setStep] = useState<'email' | 'code' | 'done'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      if (res.ok) {
        setStep('code');
        setSuccess(t('codeSent'));
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) { clearInterval(interval); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError(t('passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok) {
        setError(t('invalidCode'));
        return;
      }

      setStep('done');
      setSuccess(t('resetSuccess'));
    } catch {
      setError(t('networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setError('');

    try {
      await fetch(`${API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'PASSWORD_RESET' }),
        credentials: 'include',
      });
      setSuccess(t('codeSent'));
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError(t('networkError'));
    }
  };

  const Spinner = () => (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        {/* Back */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin')}
        </Link>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-black/20 border border-gray-100 dark:border-gray-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 mb-4">
              {step === 'done' ? <Check className="w-8 h-8 text-white" /> : <KeyRound className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {t('subtitle')}
            </p>
            {step === 'code' && (
              <p className="text-primary-600 dark:text-primary-400 mt-2 text-sm font-medium">{email}</p>
            )}
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={t('emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-800/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:to-secondary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Spinner /> : <Mail className="w-5 h-5" />}
                {isLoading ? t('sending') : t('sendCode')}
              </button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Code input */}
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('enterCode')}
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="000000"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-[0.5em] font-mono"
                />
              </div>

              {/* New password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={t('newPasswordPlaceholder')}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl border border-green-100 dark:border-green-800/30">
                  {success}
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-800/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:from-primary-600 hover:to-secondary-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? <Spinner /> : <KeyRound className="w-5 h-5" />}
                {isLoading ? t('resetting') : t('resetPassword')}
              </button>

              {/* Resend */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  {resendCooldown > 0 ? `${t('resendIn')} ${resendCooldown}s` : t('resendCode')}
                </button>
              </div>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl border border-green-100 dark:border-green-800/30">
                {success}
              </div>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-200"
              >
                {t('backToLogin')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
