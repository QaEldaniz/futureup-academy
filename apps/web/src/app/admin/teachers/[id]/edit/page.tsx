'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Users,
  ArrowLeft,
  Save,
  Globe,
  User,
  Mail,
  Lock,
  Linkedin,
  Github,
  Image,
  Briefcase,
  FileText,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';

type LangTab = 'az' | 'ru' | 'en';

const langTabs: { key: LangTab; label: string; flag: string }[] = [
  { key: 'az', label: 'Azerbaijani', flag: 'AZ' },
  { key: 'ru', label: 'Russian', flag: 'RU' },
  { key: 'en', label: 'English', flag: 'EN' },
];

interface FormData {
  nameAz: string;
  nameRu: string;
  nameEn: string;
  bioAz: string;
  bioRu: string;
  bioEn: string;
  photo: string;
  specialization: string;
  email: string;
  password: string;
  linkedin: string;
  github: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  nameAz: '',
  nameRu: '',
  nameEn: '',
  bioAz: '',
  bioRu: '',
  bioEn: '',
  photo: '',
  specialization: '',
  email: '',
  password: '',
  linkedin: '',
  github: '',
  isActive: true,
};

interface TeacherResponse {
  success: boolean;
  data: FormData & { id: string };
}

export default function AdminEditTeacherPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;
  const { token } = useAuthStore();

  const [form, setForm] = useState<FormData>(initialFormData);
  const [activeLang, setActiveLang] = useState<LangTab>('az');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeacher() {
      try {
        setLoading(true);
        const res = await api.get<TeacherResponse>(
          `/admin/teachers/${teacherId}`,
          { token: token || undefined }
        );
        if (res.success && res.data) {
          const t = res.data;
          setForm({
            nameAz: t.nameAz || '',
            nameRu: t.nameRu || '',
            nameEn: t.nameEn || '',
            bioAz: t.bioAz || '',
            bioRu: t.bioRu || '',
            bioEn: t.bioEn || '',
            photo: t.photo || '',
            specialization: t.specialization || '',
            email: t.email || '',
            password: '',
            linkedin: t.linkedin || '',
            github: t.github || '',
            isActive: t.isActive ?? true,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load teacher data.');
      } finally {
        setLoading(false);
      }
    }
    if (teacherId) fetchTeacher();
  }, [teacherId, token]);

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.nameAz.trim()) {
      setError('Teacher name (AZ) is required.');
      setActiveLang('az');
      return;
    }

    if (!form.email.trim()) {
      setError('Email is required for Teacher Portal login.');
      return;
    }

    try {
      setSaving(true);

      // Build payload; omit password if blank (keep existing)
      const payload: Partial<FormData> = { ...form };
      if (!payload.password?.trim()) {
        delete payload.password;
      }

      await api.put(`/admin/teachers/${teacherId}`, payload, {
        token: token || undefined,
      });
      router.push('/admin/teachers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update teacher.');
    } finally {
      setSaving(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
          <div className="space-y-2">
            <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
            <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
          </div>
        </div>

        {/* Form skeleton blocks */}
        {[1, 2, 3].map((block) => (
          <div
            key={block}
            className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-4 animate-pulse"
          >
            <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700/50 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-700/30 rounded-xl" />
              <div className="h-10 bg-gray-700/30 rounded-xl" />
            </div>
            {block === 1 && (
              <div className="h-24 bg-gray-700/30 rounded-xl" />
            )}
          </div>
        ))}

        {/* Actions skeleton */}
        <div className="flex justify-end gap-3">
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
          <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/teachers"
          className="p-2 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:border-gray-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary-500/10">
              <Users className="w-5 h-5 text-secondary-400" />
            </div>
            Edit Teacher
          </h1>
          <p className="text-gray-400 mt-0.5 text-sm">
            Update teacher profile and portal credentials
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Language Tabs + Localized Fields */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
          <div className="px-6 pt-5 pb-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-gray-400" />
              Localized Information
            </h2>

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-50/60 dark:bg-[#0b0f1a]/60 p-1 rounded-xl w-fit">
              {langTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveLang(tab.key)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                    activeLang === tab.key
                      ? 'bg-gradient-to-r from-primary-500/20 to-secondary-600/20 text-white shadow-sm border border-gray-200 dark:border-gray-700/30'
                      : 'text-gray-400 hover:text-gray-300'
                  )}
                >
                  <span className="mr-1.5 text-[10px] font-bold opacity-60">
                    {tab.flag}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Name field for active language */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Full Name ({activeLang.toUpperCase()}) {activeLang === 'az' && <span className="text-red-400">*</span>}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={form[`name${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as keyof FormData] as string}
                  onChange={(e) =>
                    updateField(
                      `name${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as keyof FormData,
                      e.target.value
                    )
                  }
                  placeholder={`Teacher's full name in ${langTabs.find((t) => t.key === activeLang)?.label}`}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Bio field for active language */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Biography ({activeLang.toUpperCase()})
              </label>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                <textarea
                  value={form[`bio${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as keyof FormData] as string}
                  onChange={(e) =>
                    updateField(
                      `bio${activeLang.charAt(0).toUpperCase() + activeLang.slice(1)}` as keyof FormData,
                      e.target.value
                    )
                  }
                  placeholder={`Teacher's biography in ${langTabs.find((t) => t.key === activeLang)?.label}`}
                  rows={4}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all resize-none"
                />
              </div>
            </div>

            {/* Language fill indicators */}
            <div className="flex items-center gap-4 pt-1">
              {langTabs.map((tab) => {
                const nameKey = `name${tab.key.charAt(0).toUpperCase() + tab.key.slice(1)}` as keyof FormData;
                const filled = !!(form[nameKey] as string).trim();
                return (
                  <div key={tab.key} className="flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        filled ? 'bg-emerald-400' : 'bg-gray-600'
                      )}
                    />
                    <span className={filled ? 'text-gray-300' : 'text-gray-600'}>
                      {tab.flag}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* General Information */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 text-gray-400" />
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Specialization */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Specialization
              </label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => updateField('specialization', e.target.value)}
                placeholder="e.g. Frontend Development"
                className="w-full px-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
              />
            </div>

            {/* Photo URL */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Photo URL
              </label>
              <div className="relative">
                <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={form.photo}
                  onChange={(e) => updateField('photo', e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Photo Preview */}
          {form.photo && (
            <div className="flex items-center gap-4 p-3 bg-gray-50/40 dark:bg-[#0b0f1a]/40 rounded-xl border border-gray-200 dark:border-gray-800/30">
              <img
                src={form.photo}
                alt="Preview"
                className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700/50"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-xs text-gray-400">Photo preview</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* LinkedIn */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                LinkedIn URL
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => updateField('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                GitHub URL
              </label>
              <div className="relative">
                <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="url"
                  value={form.github}
                  onChange={(e) => updateField('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Active Status</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Inactive teachers won&apos;t appear on the public website
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateField('isActive', !form.isActive)}
              className="relative"
            >
              {form.isActive ? (
                <ToggleRight className="w-10 h-10 text-emerald-400" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Portal Credentials */}
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-gray-400" />
            Teacher Portal Credentials
          </h2>
          <p className="text-xs text-gray-500 -mt-2">
            Update login credentials for the Teacher Portal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="teacher@futureup.az"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Password{' '}
                <span className="text-gray-600 font-normal">
                  (leave blank to keep current)
                </span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  placeholder="Enter new password or leave blank"
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50/60 dark:bg-[#0b0f1a]/60 border border-gray-200 dark:border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/teachers"
            className="px-5 py-2.5 rounded-xl bg-gray-800/50 text-gray-300 text-sm font-medium hover:bg-gray-200 dark:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-semibold hover:from-primary-400 hover:to-secondary-500 transition-all duration-200 shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Teacher
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
