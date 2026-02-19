'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Settings,
  Save,
  Loader2,
  Phone,
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
} from 'lucide-react';

interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  telegram: string;
  [key: string]: string;
}

const CONTACT_FIELDS = [
  {
    key: 'phone',
    label: 'Phone Number',
    icon: Phone,
    placeholder: '+994 50 123 45 67',
    type: 'tel',
  },
  {
    key: 'email',
    label: 'Email Address',
    icon: Mail,
    placeholder: 'info@futureup.az',
    type: 'email',
  },
  {
    key: 'address',
    label: 'Address',
    icon: MapPin,
    placeholder: 'Baku, Azerbaijan',
    type: 'text',
  },
];

const SOCIAL_FIELDS = [
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/futureup',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/futureup',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/futureup',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
  },
  {
    key: 'youtube',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@futureup',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/futureup',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
  },
];

const defaultSettings: SiteSettings = {
  phone: '',
  email: '',
  address: '',
  facebook: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  telegram: '',
};

export default function AdminSettingsPage() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; data: SiteSettings }>(
          '/settings',
          { token: token || undefined }
        );
        if (res.success && res.data) {
          setSettings({
            ...defaultSettings,
            ...res.data,
          });
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [token]);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSaved(false);
      const res = await api.put<{ success: boolean }>(
        '/admin/settings',
        settings,
        { token: token || undefined }
      );
      if (res.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save settings';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="w-40 h-8 bg-gray-700/50 rounded animate-pulse" />
          <div className="w-64 h-4 bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="h-64 bg-[#141927]/60 rounded-2xl border border-gray-800/50 animate-pulse" />
        <div className="h-48 bg-[#141927]/60 rounded-2xl border border-gray-800/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage site-wide configuration and contact details.</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary-400" />
            Contact Information
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Public contact details displayed on the website.
          </p>

          <div className="space-y-5">
            {CONTACT_FIELDS.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <span className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      {field.label}
                    </span>
                  </label>
                  <input
                    type={field.type}
                    value={settings[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2">
            <Globe className="w-4 h-4 text-secondary-400" />
            Social Media
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Links to your social media profiles.
          </p>

          <div className="space-y-4">
            {SOCIAL_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    field.bgColor
                  )}
                >
                  <span className={cn('text-xs font-bold', field.color)}>
                    {field.label.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="url"
                    value={settings[field.key]}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 sticky bottom-6">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200',
              'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
              'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
              'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
