'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { getLocalized } from '@/lib/admin-locale';
import { getAdminT } from '@/lib/admin-translations';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
  X,
  AlertTriangle,
  ImageIcon,
  Baby,
  Users,
} from 'lucide-react';

interface Course {
  id: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  slug: string;
  image?: string | null;
  duration?: string;
  price?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  audience?: 'KIDS' | 'ADULTS';
  ageGroup?: string | null;
  isActive: boolean;
  category?: {
    id: string;
    nameAz?: string;
    nameEn?: string;
  };
  createdAt: string;
}

interface CoursesResponse {
  success: boolean;
  data: Course[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LEVELS = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
const AUDIENCES = ['ALL', 'KIDS', 'ADULTS'] as const;

export default function AdminCoursesPage() {
  const router = useRouter();
  const { token, adminLocale } = useAuthStore();
  const t = getAdminT('courses', adminLocale);
  const tCommon = getAdminT('common', adminLocale);

  const levelConfig: Record<string, { label: string; className: string }> = {
    BEGINNER: { label: t.beginner, className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    INTERMEDIATE: { label: t.intermediate, className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    ADVANCED: { label: t.advanced, className: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [audienceFilter, setAudienceFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; course: Course | null }>({
    open: false,
    course: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
      });
      if (search) params.set('search', search);
      if (levelFilter !== 'ALL') params.set('level', levelFilter);
      if (audienceFilter !== 'ALL') params.set('audience', audienceFilter);

      const res = await api.get<CoursesResponse>(`/admin/courses?${params.toString()}`, {
        token: token || undefined,
      });

      if (res.success) {
        setCourses(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.totalPages || 1);
        setTotal(res.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, levelFilter, audienceFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search
  useEffect(() => {
    setPage(1);
  }, [search, levelFilter, audienceFilter]);

  const handleToggleActive = async (course: Course) => {
    try {
      await api.put(
        `/admin/courses/${course.id}`,
        { isActive: !course.isActive },
        { token: token || undefined }
      );
      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      console.error('Failed to toggle course status:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.course) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/courses/${deleteModal.course.id}`, {
        token: token || undefined,
      });
      setDeleteModal({ open: false, course: null });
      fetchCourses();
    } catch (err) {
      console.error('Failed to delete course:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-400 mt-1">
            {t.description}{total > 0 && ` (${total} ${t.total})`}
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          {t.addCourse}
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
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

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all',
              showFilters
                ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
            )}
          >
            <Filter className="w-4 h-4" />
            {tCommon.filters}
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800/50 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider self-center mr-2">{t.level}</span>
              {LEVELS.map((level) => (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    levelFilter === level
                      ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                      : 'bg-gray-900/30 border-gray-700/40 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
                  )}
                >
                  {level === 'ALL' ? t.allLevels : levelConfig[level]?.label || level}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider self-center mr-2">{t.audience}:</span>
              {AUDIENCES.map((aud) => (
                <button
                  key={aud}
                  onClick={() => setAudienceFilter(aud)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                    audienceFilter === aud
                      ? aud === 'KIDS'
                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                        : 'bg-primary-500/10 border-primary-500/30 text-primary-400'
                      : 'bg-gray-900/30 border-gray-700/40 text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:border-gray-600/50'
                  )}
                >
                  {aud === 'KIDS' && <Baby className="w-3 h-3" />}
                  {aud === 'ADULTS' && <Users className="w-3 h-3" />}
                  {aud === 'ALL' ? t.allAudiences : aud === 'KIDS' ? t.itKids : t.adults}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[3.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3.5 border-b border-gray-200 dark:border-gray-800/50 bg-gray-900/30">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.courseCol}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.category}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.level.replace(':', '')}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.price}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{tCommon.status}</span>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{tCommon.actions}</span>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="divide-y divide-gray-800/30">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-[3.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="w-40 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                    <div className="w-24 h-3 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse" />
                <div className="w-14 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                <div className="w-10 h-5 bg-gray-200 dark:bg-gray-700/50 rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse ml-auto" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/50 mb-4">
              <BookOpen className="w-7 h-7 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-1">{t.noCourses}</h3>
            <p className="text-sm text-gray-500 mb-6">
              {search || levelFilter !== 'ALL'
                ? t.tryAdjusting
                : t.getStarted}
            </p>
            {!search && levelFilter === 'ALL' && (
              <Link
                href="/admin/courses/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 transition-all shadow-lg shadow-primary-500/25"
              >
                <Plus className="w-4 h-4" />
                {t.createCourse}
              </Link>
            )}
          </div>
        )}

        {/* Table Rows */}
        {!loading && courses.length > 0 && (
          <div className="divide-y divide-gray-800/30">
            {courses.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-1 md:grid-cols-[3.5fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-100 dark:bg-gray-800/20 transition-colors group"
              >
                {/* Course Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-800/50 shrink-0 border border-gray-200 dark:border-gray-700/30">
                    {course.image ? (
                      <Image
                        src={course.image}
                        alt={getLocalized(course, 'title', adminLocale)}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getLocalized(course, 'title', adminLocale)}</p>
                    <p className="text-xs text-gray-500 truncate">{course.slug}</p>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <span className="text-sm text-gray-400">
                    {getLocalized(course.category, 'name', adminLocale)}
                  </span>
                </div>

                {/* Level + Audience Badges */}
                <div className="flex flex-wrap gap-1">
                  <span
                    className={cn(
                      'inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium border',
                      levelConfig[course.level]?.className || 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                    )}
                  >
                    {levelConfig[course.level]?.label || course.level}
                  </span>
                  {course.audience === 'KIDS' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-orange-500/10 text-orange-400 border-orange-500/20">
                      <Baby className="w-3 h-3" />
                      Kids
                    </span>
                  )}
                  {course.ageGroup && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {course.ageGroup === 'AGE_6_8' ? '6-8' : course.ageGroup === 'AGE_9_11' ? '9-11' : course.ageGroup === 'AGE_12_14' ? '12-14' : '15-17'} yaş
                    </span>
                  )}
                </div>

                {/* Price */}
                <div>
                  <span className="text-sm font-medium text-gray-300">
                    {course.price != null ? `${course.price} AZN` : tCommon.free}
                  </span>
                </div>

                {/* Status Toggle */}
                <div>
                  <button
                    onClick={() => handleToggleActive(course)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 focus:ring-offset-[#141927]',
                      course.isActive ? 'bg-primary-500' : 'bg-gray-700'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 shadow-sm',
                        course.isActive ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => router.push(`/admin/courses/${course.id}/lessons`)}
                    className="p-2 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                    title="Lessons & Materials"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                    className="p-2 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                    title={t.editCourse}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ open: true, course })}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title={t.deleteCourse}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {tCommon.page} {page} {tCommon.of} {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                page <= 1
                  ? 'border-gray-200 dark:border-gray-800/30 text-gray-600 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-600/50 hover:bg-gray-100 dark:bg-gray-800/30'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              {tCommon.previous}
            </button>

            {/* Page Numbers */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:bg-gray-800/30'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                page >= totalPages
                  ? 'border-gray-200 dark:border-gray-800/30 text-gray-600 cursor-not-allowed'
                  : 'border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-600/50 hover:bg-gray-100 dark:bg-gray-800/30'
              )}
            >
              {tCommon.next}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.course && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteModal({ open: false, course: null })}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-[#1a1f33] border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t.deleteTitle}</h3>
                <p className="text-sm text-gray-400">{t.cannotUndo}</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-6">
              {t.confirmDelete}{' '}
              <span className="font-semibold text-gray-900 dark:text-white">&quot;{getLocalized(deleteModal.course, 'title', adminLocale)}&quot;</span>?
              {t.allDataRemoved}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, course: null })}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-white border border-gray-200 dark:border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-100 dark:bg-gray-800/30 transition-all disabled:opacity-50"
              >
                {tCommon.cancel}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-900 dark:text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {tCommon.deleting}
                  </span>
                ) : (
                  t.deleteTitle
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
