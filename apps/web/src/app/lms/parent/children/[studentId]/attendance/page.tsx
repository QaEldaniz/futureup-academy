'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  PRESENT: { label: 'Present', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ABSENT: { label: 'Absent', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  LATE: { label: 'Late', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  EXCUSED: { label: 'Excused', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
};

export default function ParentChildAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  const { token } = useAuthStore();
  const [records, setRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [childName, setChildName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !studentId) return;
    Promise.all([
      fetch(`${API_URL}/api/parent/children/${studentId}/attendance`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/api/parent/children`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([attData, childrenData]) => {
      if (attData.success) {
        setRecords(attData.data?.records || []);
        setSummary(attData.data?.summary || {});
      }
      if (childrenData.success) {
        const child = childrenData.data?.find((c: any) => c.studentId === studentId);
        if (child) setChildName(child.name);
      }
    }).finally(() => setLoading(false));
  }, [token, studentId]);

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
      <button onClick={() => router.push(`/lms/parent/children/${studentId}`)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="w-4 h-4" /> Back to {childName || 'Child'}
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{childName ? `${childName}'s` : 'Child'} Attendance</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: summary.total || 0, color: 'text-gray-900 dark:text-white' },
          { label: 'Present', value: summary.present || 0, color: 'text-green-500' },
          { label: 'Absent', value: summary.absent || 0, color: 'text-red-500' },
          { label: 'Late', value: summary.late || 0, color: 'text-yellow-500' },
          { label: 'Rate', value: `${summary.rate || 0}%`, color: (summary.rate || 0) >= 80 ? 'text-green-500' : 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Records */}
      {records.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No attendance records</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
            {records.map((a: any) => {
              const config = STATUS_CONFIG[a.status] || STATUS_CONFIG.PRESENT;
              const Icon = config.icon;
              return (
                <div key={a.id} className="flex items-center gap-4 px-4 py-3">
                  <div className={`p-2 rounded-lg ${config.bg}`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{a.course?.titleEn || a.course?.titleAz}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(a.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
