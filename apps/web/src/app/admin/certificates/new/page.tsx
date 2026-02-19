'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Award,
  Save,
  Loader2,
  GraduationCap,
  BookOpen,
  User,
  Calendar,
  Star,
  ChevronDown,
  Search,
} from 'lucide-react';

interface SelectOption {
  id: string;
  name: string;
}

const GRADE_OPTIONS = [
  { value: 'Excellent', label: 'Excellent', color: 'text-emerald-400' },
  { value: 'Good', label: 'Good', color: 'text-blue-400' },
  { value: 'Satisfactory', label: 'Satisfactory', color: 'text-amber-400' },
];

export default function AdminCertificateNewPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Options for dropdowns
  const [students, setStudents] = useState<SelectOption[]>([]);
  const [courses, setCourses] = useState<SelectOption[]>([]);
  const [teachers, setTeachers] = useState<SelectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Form state
  const [form, setForm] = useState({
    studentId: '',
    courseId: '',
    teacherId: '',
    teacherReview: '',
    grade: 'Excellent',
    issueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    async function fetchOptions() {
      try {
        setLoadingOptions(true);
        const [studentsRes, coursesRes, teachersRes] = await Promise.all([
          api.get<{ success: boolean; data: SelectOption[] }>('/admin/students/list', {
            token: token || undefined,
          }),
          api.get<{ success: boolean; data: SelectOption[] }>('/admin/courses/list', {
            token: token || undefined,
          }),
          api.get<{ success: boolean; data: SelectOption[] }>('/admin/teachers/list', {
            token: token || undefined,
          }),
        ]);

        if (studentsRes.success) setStudents(studentsRes.data);
        if (coursesRes.success) setCourses(coursesRes.data);
        if (teachersRes.success) setTeachers(teachersRes.data);
      } catch (err) {
        console.error('Failed to fetch options:', err);
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, [token]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.studentId) {
      setError('Please select a student');
      return;
    }
    if (!form.courseId) {
      setError('Please select a course');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const res = await api.post<{ success: boolean }>(
        '/admin/certificates',
        form,
        { token: token || undefined }
      );
      if (res.success) {
        router.push('/admin/certificates');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate certificate';
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
          href="/admin/certificates"
          className="p-2 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-gray-400 hover:text-white hover:border-gray-700/50 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Generate Certificate</h1>
          <p className="text-gray-400 mt-0.5">Create a new certificate for a student.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student, Course, Teacher */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-5 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Certificate Details
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Student */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student <span className="text-red-400">*</span>
                </span>
              </label>
              <div className="relative">
                <select
                  value={form.studentId}
                  onChange={(e) => updateField('studentId', e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-[#141927]">
                    {loadingOptions ? 'Loading...' : 'Select student'}
                  </option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#141927]">
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Course */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  Course <span className="text-red-400">*</span>
                </span>
              </label>
              <div className="relative">
                <select
                  value={form.courseId}
                  onChange={(e) => updateField('courseId', e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-[#141927]">
                    {loadingOptions ? 'Loading...' : 'Select course'}
                  </option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#141927]">
                      {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Teacher
                </span>
              </label>
              <div className="relative">
                <select
                  value={form.teacherId}
                  onChange={(e) => updateField('teacherId', e.target.value)}
                  disabled={loadingOptions}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-[#141927]">
                    {loadingOptions ? 'Loading...' : 'Select teacher'}
                  </option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#141927]">
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Grade & Date */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade */}
          <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-gray-400" />
              Grade
            </h3>
            <div className="space-y-2">
              {GRADE_OPTIONS.map((grade) => (
                <button
                  key={grade.value}
                  type="button"
                  onClick={() => updateField('grade', grade.value)}
                  className={cn(
                    'flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all text-left',
                    form.grade === grade.value
                      ? 'bg-primary-500/10 border-primary-500/30 text-white'
                      : 'bg-gray-900/30 border-gray-800/30 text-gray-400 hover:border-gray-700/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                      form.grade === grade.value
                        ? 'border-primary-500'
                        : 'border-gray-600'
                    )}
                  >
                    {form.grade === grade.value && (
                      <div className="w-2 h-2 rounded-full bg-primary-500" />
                    )}
                  </div>
                  <span className={cn('text-sm font-medium', grade.color)}>
                    {grade.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Issue Date
            </h3>
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all [color-scheme:dark]"
            />
          </div>
        </div>

        {/* Teacher Review */}
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6">
          <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            Teacher Review
          </h3>
          <textarea
            value={form.teacherReview}
            onChange={(e) => updateField('teacherReview', e.target.value)}
            placeholder="Teacher's review of the student's performance..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-y transition-all"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/certificates"
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
              <Award className="w-4 h-4" />
            )}
            {saving ? 'Generating...' : 'Generate Certificate'}
          </button>
        </div>
      </form>
    </div>
  );
}
