'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ImageIcon,
  Save,
  Loader2,
  AlertCircle,
  Lock,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string | null;
  isActive: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  photo: string;
  isActive: boolean;
  password: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  photo?: string;
}

export default function AdminEditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const { token } = useAuthStore();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    photo: '',
    isActive: true,
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchStudent() {
      try {
        const res = await api.get<{ success: boolean; data: Student }>(
          `/admin/students/${studentId}`,
          { token: token || undefined }
        );

        if (res.success) {
          setFormData({
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            photo: res.data.photo || '',
            isActive: res.data.isActive !== false,
            password: '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch student:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      fetchStudent();
    }
  }, [studentId, token]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[+]?[\d\s()-]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.photo && !/^https?:\/\/.+/.test(formData.photo)) {
      newErrors.photo = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setApiError('');

    try {
      const payload: Record<string, string | boolean> = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        isActive: formData.isActive,
      };
      if (formData.phone.trim()) payload.phone = formData.phone.trim();
      else payload.phone = '';
      if (formData.photo.trim()) payload.photo = formData.photo.trim();
      else payload.photo = '';
      if (formData.password.trim()) payload.password = formData.password.trim();

      await api.put(`/admin/students/${studentId}`, payload, {
        token: token || undefined,
      });

      router.push('/admin/students');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update student';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse mb-4" />
          <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse mb-2" />
          <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
        </div>
        <div className="bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse mb-2" />
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-700/50 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Student Not Found</h2>
          <p className="text-gray-400 mb-6">
            The student you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Student</h1>
        <p className="text-gray-400 mt-1">Update the student&apos;s information below.</p>
      </div>

      {/* Form card */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800/50">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Student Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* API error */}
          {apiError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {apiError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="John Doe"
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all text-sm',
                  errors.name
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700/50 focus:ring-primary-500/50 focus:border-primary-500/50'
                )}
              />
            </div>
            {errors.name && (
              <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@example.com"
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all text-sm',
                  errors.email
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700/50 focus:ring-primary-500/50 focus:border-primary-500/50'
                )}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+994 50 123 45 67"
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all text-sm',
                  errors.phone
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700/50 focus:ring-primary-500/50 focus:border-primary-500/50'
                )}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-xs text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Photo URL
            </label>
            <div className="relative">
              <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => handleChange('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={cn(
                  'w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all text-sm',
                  errors.photo
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                    : 'border-gray-200 dark:border-gray-700/50 focus:ring-primary-500/50 focus:border-primary-500/50'
                )}
              />
            </div>
            {errors.photo && (
              <p className="mt-1.5 text-xs text-red-400">{errors.photo}</p>
            )}
            {formData.photo && !errors.photo && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.photo}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">Photo preview</span>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <button
              type="button"
              onClick={() => handleChange('isActive', !formData.isActive)}
              className={cn(
                'w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left',
                formData.isActive
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              )}
            >
              {formData.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>

          {/* New Password (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New LMS Password <span className="text-gray-500 text-xs">(leave empty to keep current)</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800/50">
            <Link
              href="/admin/students"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200',
                'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
                'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
                'active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
