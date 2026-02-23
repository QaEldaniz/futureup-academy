'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  Star,
  Globe,
  User,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';

const TABS = [
  { key: 'az', label: 'AZ', full: 'Azerbaijani' },
  { key: 'ru', label: 'RU', full: 'Russian' },
  { key: 'en', label: 'EN', full: 'English' },
] as const;

type LangKey = (typeof TABS)[number]['key'];

export default function AdminTestimonialNewPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LangKey>('az');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    photo: '',
    textAz: '',
    textRu: '',
    textEn: '',
    rating: 5,
    courseAz: '',
    courseRu: '',
    courseEn: '',
    isActive: true,
  });

  const updateField = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!form.textAz.trim()) {
      setError('Text (AZ) is required');
      setActiveTab('az');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const res = await api.post<{ success: boolean }>(
        '/admin/testimonials',
        form,
        { token: token || undefined }
      );
      if (res.success) {
        router.push('/admin/testimonials');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create testimonial';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/testimonials"
          className="p-2 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:border-gray-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Testimonial</h1>
          <p className="text-gray-400 mt-0.5">Add a new student testimonial.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-5 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Student name"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Photo URL
                </span>
              </label>
              <input
                type="text"
                value={form.photo}
                onChange={(e) => updateField('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-gray-300 mb-3">Rating</label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateField('rating', i + 1)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-7 h-7 transition-colors',
                      i < form.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-600 hover:text-gray-500'
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-400">{form.rating}/5</span>
            </div>
          </div>

          {/* Active toggle */}
          <div className="mt-5">
            <button
              type="button"
              onClick={() => updateField('isActive', !form.isActive)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
                form.isActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400'
              )}
            >
              {form.isActive ? (
                <ToggleRight className="w-6 h-6" />
              ) : (
                <ToggleLeft className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>
          </div>
        </div>

        {/* Language tabs */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-800/50">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'text-primary-400 border-primary-500'
                    : 'text-gray-400 border-transparent hover:text-gray-700 dark:text-gray-300 hover:border-gray-700'
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {TABS.map((tab) => {
              const suffix = tab.key.charAt(0).toUpperCase() + tab.key.slice(1);
              return (
                <div
                  key={tab.key}
                  className={cn('space-y-5', activeTab !== tab.key && 'hidden')}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Testimonial Text ({tab.full}){' '}
                      {tab.key === 'az' && <span className="text-red-400">*</span>}
                    </label>
                    <textarea
                      value={form[`text${suffix}` as keyof typeof form] as string}
                      onChange={(e) => updateField(`text${suffix}`, e.target.value)}
                      placeholder={`Testimonial text in ${tab.full}...`}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-y transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Course Name ({tab.full})
                    </label>
                    <input
                      type="text"
                      value={form[`course${suffix}` as keyof typeof form] as string}
                      onChange={(e) => updateField(`course${suffix}`, e.target.value)}
                      placeholder={`Course name in ${tab.full}...`}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/testimonials"
            className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-600/50 text-sm font-medium transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
              'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
              'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
              'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Creating...' : 'Create Testimonial'}
          </button>
        </div>
      </form>
    </div>
  );
}
