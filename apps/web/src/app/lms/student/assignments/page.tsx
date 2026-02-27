'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import {
  Clock, CheckCircle2, AlertCircle, Send, FileText, Award,
  Calendar, BookOpen, ArrowRight,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: number;
  courseId: string;
  course: { id: string; titleAz: string; titleRu: string; titleEn: string };
  teacher: { id: string; nameAz: string; nameRu: string; nameEn: string } | null;
  submission: {
    id: string;
    status: string;
    grade: number | null;
    feedback: string | null;
    submittedAt: string | null;
  } | null;
  isOverdue: boolean;
  createdAt: string;
}

function StatusBadge({ status, isOverdue }: { status: string; isOverdue?: boolean }) {
  const { t } = useLmsT();
  if (isOverdue && (!status || status === 'NOT_SUBMITTED')) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><AlertCircle className="w-3 h-3" />{t('statusOverdue')}</span>;
  }
  const config: Record<string, { labelKey: string; color: string }> = {
    NOT_SUBMITTED: { labelKey: 'statusPending', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    SUBMITTED: { labelKey: 'statusSubmitted', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    LATE: { labelKey: 'statusLate', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    GRADED: { labelKey: 'statusGraded', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    RETURNED: { labelKey: 'statusReturned', color: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' },
  };
  const c = config[status] || config.NOT_SUBMITTED;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>{t(c.labelKey)}</span>;
}

type FilterType = 'all' | 'pending' | 'submitted' | 'graded';

export default function StudentAllAssignmentsPage() {
  const router = useRouter();
  const { t, tField } = useLmsT();
  const { token } = useAuthStore();

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/assignments/student/my${filter !== 'all' ? `?status=${filter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setAssignments(json.data);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => { setLoading(true); fetchAssignments(); }, [fetchAssignments]);

  const filters: { key: FilterType; label: string; icon: React.ElementType }[] = [
    { key: 'all', label: t('all'), icon: FileText },
    { key: 'pending', label: t('statusPending'), icon: Clock },
    { key: 'submitted', label: t('statusSubmitted'), icon: Send },
    { key: 'graded', label: t('statusGraded'), icon: CheckCircle2 },
  ];

  // Summary counts
  const allItems = assignments;
  const pendingCount = allItems.filter((a) => !a.submission || a.submission.status === 'NOT_SUBMITTED').length;
  const overdueCount = allItems.filter((a) => a.isOverdue).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myAssignments')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('allAssignmentsCourses')}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{allItems.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('total')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{pendingCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statusPending')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueCount}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('overdue')}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {allItems.filter((a) => a.submission?.status === 'GRADED').length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('statusGraded')}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {f.label}
            </button>
          );
        })}
      </div>

      {/* Assignment list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'all' ? t('noAssignmentsYet') : `${t('noData')}`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              onClick={() => router.push(`/lms/student/courses/${a.courseId}/assignments`)}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{a.title}</h3>
                    <StatusBadge status={a.submission?.status || 'NOT_SUBMITTED'} isOverdue={a.isOverdue} />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary-600 dark:text-primary-400 mb-2">
                    <BookOpen className="w-3 h-3" />
                    {tField(a.course, 'title')}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                    {a.dueDate && (
                      <span className={`flex items-center gap-1 ${a.isOverdue ? 'text-red-500 font-medium' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {a.maxScore} {t('pts')}</span>
                    {a.submission?.grade !== null && a.submission?.grade !== undefined && (
                      <span className="font-semibold text-green-600 dark:text-green-400">{a.submission.grade}/{a.maxScore}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
