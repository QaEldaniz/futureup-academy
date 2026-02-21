'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  { value: 'ABSENT', label: 'Absent', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  { value: 'LATE', label: 'Late', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  { value: 'EXCUSED', label: 'Excused', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20' },
];

export default function TeacherAttendancePage() {
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, { status: string; note: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch teacher's courses
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/teacher/courses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setCourses(d.data || []);
          if (d.data?.length > 0) setSelectedCourse(d.data[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Fetch students + existing attendance when course or date changes
  useEffect(() => {
    if (!token || !selectedCourse) return;
    Promise.all([
      fetch(`${API_URL}/api/teacher/courses/${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/api/teacher/courses/${selectedCourse}/attendance?date=${selectedDate}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([courseData, attendanceData]) => {
      const studs = courseData.success ? courseData.data.students || [] : [];
      setStudents(studs);

      // Initialize records with existing attendance or PRESENT default
      const existingMap = new Map<string, { status: string; note: string }>(
        (attendanceData.data || []).map((a: any) => [a.studentId, { status: a.status, note: a.note || '' }])
      );
      const initRecords: Record<string, { status: string; note: string }> = {};
      studs.forEach((s: any) => {
        initRecords[s.student.id] = existingMap.get(s.student.id) ?? { status: 'PRESENT', note: '' };
      });
      setRecords(initRecords);
    });
  }, [token, selectedCourse, selectedDate]);

  const handleSave = async () => {
    if (!selectedCourse) return;
    setSaving(true);
    setMessage('');
    try {
      const body = {
        date: selectedDate,
        records: Object.entries(records).map(([studentId, rec]) => ({
          studentId,
          status: rec.status,
          note: rec.note || undefined,
        })),
      };
      const res = await fetch(`${API_URL}/api/teacher/courses/${selectedCourse}/attendance`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (d.success) {
        setMessage(`Attendance saved for ${d.count} students!`);
      } else {
        setMessage(d.message || 'Error saving attendance');
      }
    } catch {
      setMessage('Network error');
    }
    setSaving(false);
  };

  const setAllStatus = (status: string) => {
    const updated = { ...records };
    Object.keys(updated).forEach((id) => { updated[id] = { ...updated[id], status }; });
    setRecords(updated);
  };

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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.titleEn || c.titleAz}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 self-center">Mark all:</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAllStatus(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${opt.bg} ${opt.color} border-current/20 hover:opacity-80`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Student attendance table */}
      {students.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No students enrolled in this course</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Note</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const rec = records[s.student.id] || { status: 'PRESENT', note: '' };
                  return (
                    <tr key={s.student.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                            {s.student.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{s.student.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{s.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-1">
                          {STATUS_OPTIONS.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = rec.status === opt.value;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => setRecords({ ...records, [s.student.id]: { ...rec, status: opt.value } })}
                                className={`p-2 rounded-lg transition-all ${
                                  isSelected
                                    ? `${opt.bg} ${opt.color} ring-2 ring-current/30`
                                    : 'text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400'
                                }`}
                                title={opt.label}
                              >
                                <Icon className="w-5 h-5" />
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={rec.note}
                          onChange={(e) => setRecords({ ...records, [s.student.id]: { ...rec, note: e.target.value } })}
                          placeholder="Optional note..."
                          className="w-full px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save */}
      {students.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
          {message && (
            <p className={`text-sm font-medium ${message.includes('saved') ? 'text-green-500' : 'text-red-500'}`}>
              {message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
