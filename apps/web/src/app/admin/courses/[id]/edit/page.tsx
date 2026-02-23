'use client';

import { useState, useEffect, use } from 'react';
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
  GraduationCap,
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

interface CourseData {
  id: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  slug: string;
  image?: string | null;
  duration?: string;
  price?: number | null;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  audience?: 'KIDS' | 'ADULTS';
  ageGroup?: string | null;
  categoryId?: string;
  isActive: boolean;
}

interface CourseResponse {
  success: boolean;
  data: CourseData;
}

type LangTab = 'az' | 'ru' | 'en';

const langTabs: { key: LangTab; label: string; flag: string }[] = [
  { key: 'az', label: 'Azerbaijani', flag: 'AZ' },
  { key: 'ru', label: 'Russian', flag: 'RU' },
  { key: 'en', label: 'English', flag: 'EN' },
];

interface TeacherOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
  email: string;
}

interface CourseFormData {
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  shortDescAz: string;
  shortDescRu: string;
  shortDescEn: string;
  slug: string;
  image: string;
  duration: string;
  price: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  audience: 'KIDS' | 'ADULTS';
  ageGroup: string;
  categoryId: string;
  isActive: boolean;
  teacherIds: string[];
  studentIds: string[];
}

const AGE_GROUPS = [
  { value: 'AGE_6_8', label: '6-8 yaş (1-2 sinif)', emoji: '🧒' },
  { value: 'AGE_9_11', label: '9-11 yaş (3-5 sinif)', emoji: '👦' },
  { value: 'AGE_12_14', label: '12-14 yaş (6-8 sinif)', emoji: '🧑' },
  { value: 'AGE_15_17', label: '15-17 yaş (9-11 sinif)', emoji: '🎓' },
];

export default function AdminEditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuthStore();

  const [form, setForm] = useState<CourseFormData>({
    titleAz: '',
    titleRu: '',
    titleEn: '',
    descAz: '',
    descRu: '',
    descEn: '',
    shortDescAz: '',
    shortDescRu: '',
    shortDescEn: '',
    slug: '',
    image: '',
    duration: '',
    price: '',
    level: 'BEGINNER',
    audience: 'ADULTS',
    ageGroup: '',
    categoryId: '',
    isActive: true,
    teacherIds: [],
    studentIds: [],
  });
  const [activeTab, setActiveTab] = useState<LangTab>('az');
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTeachers, setAllTeachers] = useState<TeacherOption[]>([]);
  const [allStudents, setAllStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [autoSlug, setAutoSlug] = useState(false);

  // Fetch course data
  useEffect(() => {
    async function fetchCourse() {
      try {
        const res = await api.get<CourseResponse>(`/admin/courses/${id}`, {
          token: token || undefined,
        });
        if (res.success) {
          const c = res.data as any;
          const tIds = (c.teachers || []).map((t: any) => t.teacher?.id || t.teacherId);
          const sIds = (c.students || []).map((s: any) => s.student?.id || s.studentId);
          setForm({
            titleAz: c.titleAz || '',
            titleRu: c.titleRu || '',
            titleEn: c.titleEn || '',
            descAz: c.descAz || '',
            descRu: c.descRu || '',
            descEn: c.descEn || '',
            shortDescAz: c.shortDescAz || '',
            shortDescRu: c.shortDescRu || '',
            shortDescEn: c.shortDescEn || '',
            slug: c.slug || '',
            image: c.image || '',
            duration: c.duration || '',
            price: c.price != null ? String(c.price) : '',
            level: c.level || 'BEGINNER',
            audience: c.audience || 'ADULTS',
            ageGroup: c.ageGroup || '',
            categoryId: c.categoryId || '',
            isActive: c.isActive ?? true,
            teacherIds: tIds,
            studentIds: sIds,
          });
        }
      } catch (err) {
        console.error('Failed to fetch course:', err);
        setError('Failed to load course data.');
      } finally {
        setLoading(false);
      }
    }
    fetchCourse();
  }, [id, token]);

  // Fetch categories, teachers, students
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [catRes, teacherRes, studentRes] = await Promise.all([
          api.get<CategoriesResponse>('/admin/categories', { token: token || undefined }).catch(() => ({ success: false, data: [] })),
          api.get<{ success: boolean; data: any[] }>('/admin/teachers', { token: token || undefined }).catch(() => ({ success: false, data: [] })),
          api.get<{ success: boolean; data: any }>('/admin/students?limit=50', { token: token || undefined }).catch(() => ({ success: false, data: [] })),
        ]);
        if (catRes.success) setCategories(catRes.data as Category[]);
        if (teacherRes.success) {
          const raw = teacherRes.data;
          const teachers = Array.isArray(raw) ? raw : (raw as any).teachers || [];
          setAllTeachers(teachers.map((t: any) => ({ id: t.id, name: t.nameEn || t.nameAz || t.nameRu || '' })));
        }
        if (studentRes.success) {
          const raw = studentRes.data;
          const students = Array.isArray(raw) ? raw : (raw as any).data || [];
          setAllStudents(students.map((s: any) => ({ id: s.id, name: s.name || s.email, email: s.email })));
        }
      } catch {
        console.log('Failed to fetch options');
      }
    }
    fetchOptions();
  }, [token]);

  // Auto-generate slug from English title (only when explicitly toggled)
  useEffect(() => {
    if (autoSlug && form.titleEn) {
      setForm((prev) => ({ ...prev, slug: slugify(form.titleEn) }));
    }
  }, [form.titleEn, autoSlug]);

  const updateField = (field: keyof CourseFormData, value: string | boolean | string[]) => {
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
        ageGroup: form.audience === 'KIDS' && form.ageGroup ? form.ageGroup : null,
      };

      const res = await api.put<{ success: boolean }>(`/admin/courses/${id}`, payload, {
        token: token || undefined,
      });

      if (res.success) {
        router.push('/admin/courses');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update course';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Language tabs skeleton */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700/50 rounded-lg animate-pulse" />
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700/50 rounded-lg animate-pulse" />
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700/50 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
            <div className="w-full h-32 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Details skeleton */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-5">
          <div className="w-32 h-5 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
            <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-5">
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex justify-end gap-3 pt-2">
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
          <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
          <p className="text-gray-400 mt-0.5 text-sm">
            Update course information
          </p>
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
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
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
                    : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800/30'
                )}
              >
                <span className="mr-1.5 text-[10px] font-bold opacity-60">{tab.flag}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 space-y-5 border-t border-gray-200 dark:border-gray-800/30">
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description ({activeTab.toUpperCase()}) <span className="text-gray-500 text-xs">max 300 chars</span>
              </label>
              <input
                type="text"
                maxLength={300}
                value={form[`shortDesc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof CourseFormData] as string}
                onChange={(e) =>
                  updateField(
                    `shortDesc${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}` as keyof CourseFormData,
                    e.target.value
                  )
                }
                placeholder={`Short description for cards (${langTabs.find((t) => t.key === activeTab)?.label})`}
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
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
                className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all resize-none"
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
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Course Details</h2>

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
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              {autoSlug ? 'Auto-generated from English title.' : 'Edit the slug or type in English title to auto-generate.'}
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
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
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
                      ? 'bg-primary-500/15 border-primary-500/40 text-primary-400'
                      : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
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
                      : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
                  )}
                >
                  <Baby className="w-4 h-4" />
                  IT Kids
                </button>
              </div>
            </div>

            {/* Age Group (only for KIDS) */}
            {form.audience === 'KIDS' && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_GROUPS.map((ag) => (
                    <button
                      key={ag.value}
                      type="button"
                      onClick={() => updateField('ageGroup', ag.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border transition-all',
                        form.ageGroup === ag.value
                          ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                          : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
                      )}
                    >
                      <span>{ag.emoji}</span>
                      {ag.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
              <div className="relative">
                <FolderOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={form.categoryId}
                  onChange={(e) => updateField('categoryId', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
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

          {/* Assign Teachers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users className="inline w-4 h-4 mr-1.5 text-gray-500" />
              Assigned Teachers
            </label>
            <div className="space-y-2">
              {allTeachers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allTeachers.map((teacher) => {
                    const selected = form.teacherIds.includes(teacher.id);
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            teacherIds: selected
                              ? prev.teacherIds.filter((tid) => tid !== teacher.id)
                              : [...prev.teacherIds, teacher.id],
                          }));
                        }}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left',
                          selected
                            ? 'bg-primary-500/15 border-primary-500/40 text-primary-400'
                            : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
                        )}
                      >
                        <span className={cn('w-2 h-2 rounded-full', selected ? 'bg-primary-400' : 'bg-gray-600')} />
                        {teacher.name}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No teachers available</p>
              )}
              <p className="text-xs text-gray-500">{form.teacherIds.length} teacher(s) assigned</p>
            </div>
          </div>

          {/* Enroll Students */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <GraduationCap className="inline w-4 h-4 mr-1.5 text-gray-500" />
              Enrolled Students
            </label>
            <div className="space-y-2">
              {allStudents.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {allStudents.map((student) => {
                    const selected = form.studentIds.includes(student.id);
                    return (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({
                            ...prev,
                            studentIds: selected
                              ? prev.studentIds.filter((sid) => sid !== student.id)
                              : [...prev.studentIds, student.id],
                          }));
                        }}
                        className={cn(
                          'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm border transition-all',
                          selected
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : 'bg-gray-900/30 border-gray-200 dark:border-gray-800/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-200 dark:border-gray-700/50'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={cn('w-2 h-2 rounded-full', selected ? 'bg-emerald-400' : 'bg-gray-600')} />
                          {student.name}
                        </span>
                        <span className="text-xs text-gray-500">{student.email}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No students available</p>
              )}
              <p className="text-xs text-gray-500">{form.studentIds.length} student(s) enrolled</p>
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
              className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white border border-gray-200 dark:border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-100 dark:bg-gray-800/30 transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
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
                Updating...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
