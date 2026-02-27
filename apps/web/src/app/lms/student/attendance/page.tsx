'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_CONFIG: Record<string, { labelKey: string; icon: any; color: string; bg: string }> = {
  PRESENT: { labelKey: 'statusPresent', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ABSENT: { labelKey: 'statusAbsent', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  LATE: { labelKey: 'statusLate', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  EXCUSED: { labelKey: 'statusExcused', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
};

export default function StudentAttendancePage() {
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/student/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCourses(d.data || []); });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = filterCourse ? `?courseId=${filterCourse}` : '';
    fetch(`${API_URL}/api/student/attendance${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setData(d.data || []);
          setSummary(d.summary || {});
        }
      })
      .finally(() => setLoading(false));
  }, [token, filterCourse]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myAttendance')}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: t('total'), value: summary.total || 0, color: 'text-gray-900 dark:text-white' },
          { label: t('present'), value: summary.present || 0, color: 'text-green-500' },
          { label: t('absent'), value: summary.absent || 0, color: 'text-red-500' },
          { label: t('late'), value: summary.late || 0, color: 'text-yellow-500' },
          { label: t('rate'), value: `${summary.rate || 0}%`, color: (summary.rate || 0) >= 80 ? 'text-green-500' : 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div>
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">{t('allCourses')}</option>
          {courses.map((c: any) => (
            <option key={c.courseId} value={c.courseId}>{tField(c.course, 'title')}</option>
          ))}
        </select>
      </div>

      {/* Attendance list */}
      {data.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('noAttendanceRecords')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {data.map((a: any) => {
              const config = STATUS_CONFIG[a.status] || STATUS_CONFIG.PRESENT;
              const Icon = config.icon;
              return (
                <div key={a.id} className="flex items-center gap-4 px-4 py-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tField(a.course, 'title')}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                    {t(config.labelKey)}
                  </span>
                  {a.note && <p className="text-xs text-gray-400 max-w-[150px] truncate">{a.note}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
