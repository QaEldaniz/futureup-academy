'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Filter,
  Users,
  X,
  AlertCircle,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photo?: string | null;
  enrolledCourses?: number;
  isActive?: boolean;
  courses?: { courseId: string }[];
  _count?: { certificates?: number; reviewsReceived?: number };
  createdAt: string;
}

interface StudentsResponse {
  success: boolean;
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  inactive: { label: 'Inactive', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const limit = 20;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (courseFilter) params.set('course', courseFilter);

      const res = await api.get<StudentsResponse>(
        `/admin/students?${params.toString()}`,
        { token: token || undefined }
      );

      if (res.success) {
        setStudents(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, courseFilter]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, courseFilter]);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.delete(`/admin/students/${id}`, { token: token || undefined });
      setDeleteId(null);
      fetchStudents();
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const activeFiltersCount = [statusFilter, courseFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-gray-400 mt-1">
            Manage all enrolled students
            {!loading && <span className="text-gray-500"> &middot; {total} total</span>}
          </p>
        </div>
        <Link
          href="/admin/students/new"
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          Add Student
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
              showFilters || activeFiltersCount > 0
                ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-500/20 text-primary-300 text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800/50 flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by course name..."
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
            />

            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCourseFilter('');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  Phone
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  Courses
                </th>
                <th className="text-center px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse mx-auto" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse ml-auto" />
                    </td>
                  </tr>
                ))
              ) : students.length > 0 ? (
                students.map((student) => {
                  const statusKey = student.isActive !== false ? 'active' : 'inactive';
                  const statusCfg = STATUS_CONFIG[statusKey] || {
                    label: 'Unknown',
                    className: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
                  };

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-100 dark:bg-gray-800/20 transition-colors group"
                    >
                      {/* Student name + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {student.photo ? (
                            <Image
                              src={student.photo}
                              alt={student.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-primary-400 font-bold text-sm">
                              {getInitials(student.name)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 md:hidden truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-gray-300">{student.email}</span>
                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-gray-400">
                          {student.phone || '-'}
                        </span>
                      </td>

                      {/* Enrolled courses */}
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                          <GraduationCap className="w-3.5 h-3.5 text-gray-500" />
                          {student.courses?.length ?? student.enrolledCourses ?? 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            'inline-block px-2.5 py-1 rounded-full text-[11px] font-medium border',
                            statusCfg.className
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            href={`/admin/students/${student.id}/edit`}
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all"
                            title="Edit student"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(student.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                      <div className="w-16 h-16 rounded-2xl bg-gray-800/50 flex items-center justify-center mb-4">
                        <Users className="w-7 h-7 text-gray-600" />
                      </div>
                      <p className="text-gray-400 font-medium mb-1">No students found</p>
                      <p className="text-sm text-gray-500 text-center max-w-sm">
                        {search || statusFilter || courseFilter
                          ? 'Try adjusting your search or filters to find what you are looking for.'
                          : 'Get started by adding your first student.'}
                      </p>
                      {!search && !statusFilter && !courseFilter && (
                        <Link
                          href="/admin/students/new"
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 text-sm font-medium transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Student
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800/50">
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={cn(
                  'p-2 rounded-lg border transition-all text-sm',
                  page === 1
                    ? 'border-gray-200 dark:border-gray-800/30 text-gray-600 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                        page === pageNum
                          ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                          : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={cn(
                  'p-2 rounded-lg border transition-all text-sm',
                  page === totalPages
                    ? 'border-gray-200 dark:border-gray-800/30 text-gray-600 cursor-not-allowed'
                    : 'border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteId(null)}
          />
          <div className="relative bg-white dark:bg-[#1a2035] border border-gray-200 dark:border-gray-800/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Student</h3>
                <p className="text-sm text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete this student? All associated data including
              enrollments and certificates will be permanently removed.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                className={cn(
                  'px-4 py-2.5 rounded-xl text-sm font-medium text-gray-900 dark:text-white transition-all',
                  'bg-red-500/80 hover:bg-red-500 shadow-lg shadow-red-500/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {deleting ? 'Deleting...' : 'Delete Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
