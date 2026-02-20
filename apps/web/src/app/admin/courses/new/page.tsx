'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn, slugify } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  BookOpen,
  Globe,
  ImageIcon,
  Clock,
  DollarSign,
  BarChart3,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
  Users,
  Baby,
} from 'lucide-react';

interface Category {
  id: string;
  nameAz: string;
  nameRu?: string;
  nameEn?: string;
}

interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

type LangTab = 'az' | 'ru' | 'en';

const langTabs: { key: LangTab; label: string; flag: string }[] = [
  { key: 'az', label: 'Azerbaijani', flag: 'AZ' },
  { key: 'ru', label: 'Russian', flag: 'RU' },
  { key: 'en', label: 'English', flag: 'EN' },
];

interface CourseFormData {
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  slug: string;
  image: string;
  duration: string;
  price: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  audience: 'KIDS' | 'ADULTS';
  categoryId: string;
  isActive: boolean;
}

const initialFormData: CourseFormData = {
  titleAz: '',
  titleRu: '',
  titleEn: '',
  descAz: '',
  descRu: '',
  descEn: '',
  slug: '',
  image: '',
  duration: '',
  price: '',
  level: 'BEGINNER',
  audience: 'ADULTS',
  categoryId: '',
  isActive: true,
};

export default function AdminNewCoursePage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [form, setForm] = useState<CourseFormData>(initialFormData);
  const [activeTab, setActiveTab] = useState<LangTab>('az');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(true);

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<CategoriesResponse>('/admin/categories', {
          token: token || undefined,
        });
        if (res.success) {
          setCategories(res.data);
        }
      } catch {
        console.log('Categories API not available');
      }
    }
    fetchCategories();
  }, [token]);

  // Auto-generate slug from English title
  useEffect(() => {
    if (autoSlug && form.titleEn) {
      setForm((prev) => ({ ...prev, slug: slugify(form.titleEn) }));
    }
  }, [form.titleEn, autoSlug]);

  const updateField = (field: keyof CourseFormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'slug') setAutoSlug(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        ...form,
        price: form.price ? Number(form.price) : null,
        slug: form.slug || slugify(form.titleEn || form.titleAz),
      };

      const res = await api.post<{ success: boolean }>('/admin/courses', payload, {
        token: token || undefined,
      });

      if (res.success) {
        router.push('/admin/courses');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create course';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Course</h1>
          <p className="text-gray-400 mt-0.5 text-sm">Add a new course to the academy</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Tabs + Localized Fields */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-1 px-6 pt-5 pb-0">
            <Globe className="w-4 h-4 text-gray-500 mr-2" />
            {langTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-t-xl text-sm font-medium transition-all border-b-2',
                  activeTab === tab.key
                    ? 'text-primary-400 border-primary-500 bg-primary-500/5'
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-gray-800/30'
                )}
              >
                <span className="mr-1.5 text-[10px] font-bold opacity-60">{tab.flag}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5 border-t border-gray-800/30">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title ({activeTab.toUpperCase()})
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={form[`title${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof CourseFormData] as string}
                  onChange={(e) =>
                    updateField(
                      `title${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof CourseFormData,
                      e.target.value
                    )
                  }
                  placeholder={`Course title in ${langTabs.find((t) => t.key === activeTab)?.label}`}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description ({activeTab.toUpperCase()})
              </label>
              <textarea
                value={form[`desc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof CourseFormData] as string}
                onChange={(e) =>
                  updateField(
                    `desc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof CourseFormData,
                    e.target.value
                  )
                }
                placeholder={`Course description in ${langTabs.find((t) => t.key === activeTab)?.label}`}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
              />
            </div>

            {/* Filled Indicators */}
            <div className="flex items-center gap-3 pt-2">
              {langTabs.map((tab) => {
                const titleKey = `title${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof CourseFormData;
                const descKey = `desc${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof CourseFormData;
                const filled = !!(form[titleKey] && form[descKey]);
                return (
                  <div
                    key={tab.key}
                    className={cn(
                      'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                      filled
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-gray-800/50 text-gray-500'
                    )}
                  >
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        filled ? 'bg-emerald-400' : 'bg-gray-600'
                      )}
                    />
                    {tab.flag}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-white mb-1">Course Details</h2>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Slug</label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                placeholder="course-slug"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {autoSlug ? 'Auto-generated from English title. Edit to set manually.' : 'Custom slug set.'}
            </p>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={form.image}
                onChange={(e) => updateField('image', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
          </div>

          {/* Two-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => updateField('duration', e.target.value)}
                  placeholder="e.g. 3 months"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Price (AZN)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Level</label>
              <div className="relative">
                <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={form.level}
                  onChange={(e) => updateField('level', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>

            {/* Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Audience</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateField('audience', 'ADULTS')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all',
                    form.audience === 'ADULTS'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                      : 'bg-gray-900/50 border-gray-700/50 text-gray-400 hover:text-gray-300 hover:border-gray-600/50'
                  )}
                >
                  <Users className="w-4 h-4" />
                  Adults
                </button>
                <button
                  type="button"
                  onClick={() => updateField('audience', 'KIDS')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all',
                    form.audience === 'KIDS'
                      ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                      : 'bg-gray-900/50 border-gray-700/50 text-gray-400 hover:text-gray-300 hover:border-gray-600/50'
                  )}
                >
                  <Baby className="w-4 h-4" />
                  IT Kids
                </button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <div className="relative">
                <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAz || cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-gray-300">Active Status</p>
              <p className="text-xs text-gray-500 mt-0.5">Make this course visible to students</p>
            </div>
            <button
              type="button"
              onClick={() => updateField('isActive', !form.isActive)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {form.isActive ? (
                <ToggleRight className="w-10 h-10 text-primary-500" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/courses"
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
              'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
              'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
              'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
