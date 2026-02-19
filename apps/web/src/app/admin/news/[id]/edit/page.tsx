'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Globe,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

const TABS = [
  { key: 'az', label: 'AZ', full: 'Azerbaijani' },
  { key: 'ru', label: 'RU', full: 'Russian' },
  { key: 'en', label: 'EN', full: 'English' },
] as const;

type LangKey = (typeof TABS)[number]['key'];

export default function AdminNewsEditPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState<LangKey>('az');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    titleAz: '',
    titleRu: '',
    titleEn: '',
    contentAz: '',
    contentRu: '',
    contentEn: '',
    image: '',
    isPublished: false,
  });

  useEffect(() => {
    async function fetchArticle() {
      try {
        const res = await api.get<{ success: boolean; data: typeof form }>(
          `/admin/news/${params.id}`,
          { token: token || undefined }
        );
        if (res.success) {
          setForm({
            titleAz: res.data.titleAz || '',
            titleRu: res.data.titleRu || '',
            titleEn: res.data.titleEn || '',
            contentAz: res.data.contentAz || '',
            contentRu: res.data.contentRu || '',
            contentEn: res.data.contentEn || '',
            image: res.data.image || '',
            isPublished: res.data.isPublished || false,
          });
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchArticle();
  }, [params.id, token]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleAz.trim()) {
      setError('Title (AZ) is required');
      setActiveTab('az');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const res = await api.put<{ success: boolean }>(
        `/admin/news/${params.id}`,
        form,
        { token: token || undefined }
      );
      if (res.success) {
        router.push('/admin/news');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update article';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-700/50 animate-pulse" />
          <div className="space-y-2">
            <div className="w-40 h-6 bg-gray-700/50 rounded animate-pulse" />
            <div className="w-56 h-4 bg-gray-700/50 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-96 bg-[#141927]/60 rounded-2xl border border-gray-800/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/news"
          className="p-2 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-gray-400 hover:text-white hover:border-gray-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Article</h1>
          <p className="text-gray-400 mt-0.5">Update news article details.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language tabs */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-800/50">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'text-primary-400 border-primary-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-700'
                )}
              >
                <Globe className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5">
            {TABS.map((tab) => (
              <div
                key={tab.key}
                className={cn('space-y-5', activeTab !== tab.key && 'hidden')}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title ({tab.full}) {tab.key === 'az' && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    value={form[`title${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof typeof form] as string}
                    onChange={(e) =>
                      updateField(
                        `title${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}`,
                        e.target.value
                      )
                    }
                    placeholder={`Article title in ${tab.full}...`}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content ({tab.full})
                  </label>
                  <textarea
                    value={form[`content${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof typeof form] as string}
                    onChange={(e) =>
                      updateField(
                        `content${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}`,
                        e.target.value
                      )
                    }
                    placeholder={`Article content in ${tab.full}...`}
                    rows={10}
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-y transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Image & Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image */}
          <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-gray-400" />
                Cover Image
              </div>
            </label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => updateField('image', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
            />
            {form.image && (
              <div className="mt-4 rounded-xl overflow-hidden border border-gray-700/30">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4">Publishing</h3>
            <button
              type="button"
              onClick={() => updateField('isPublished', !form.isPublished)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all',
                form.isPublished
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-gray-900/50 border-gray-700/50 text-gray-400'
              )}
            >
              {form.isPublished ? (
                <Eye className="w-5 h-5" />
              ) : (
                <EyeOff className="w-5 h-5" />
              )}
              <div className="text-left">
                <p className="text-sm font-medium">
                  {form.isPublished ? 'Published' : 'Draft'}
                </p>
                <p className="text-xs text-gray-500">
                  {form.isPublished
                    ? 'This article is visible to the public'
                    : 'This article is only visible to admins'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/news"
            className="px-6 py-2.5 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white hover:border-gray-600/50 text-sm font-medium transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
