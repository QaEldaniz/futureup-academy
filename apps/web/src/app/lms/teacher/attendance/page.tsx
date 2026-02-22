'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import {
  Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Save, Loader2,
  ClipboardList, History, ChevronLeft, ChevronRight, BarChart3,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Present', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20', short: 'P' },
  { value: 'ABSENT', label: 'Absent', icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', short: 'A' },
  { value: 'LATE', label: 'Late', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', short: 'L' },
  { value: 'EXCUSED', label: 'Excused', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-900/20', short: 'E' },
];

const STATUS_CELL: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  PRESENT: { icon: '\u2713', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', label: 'Present' },
  ABSENT: { icon: '\u2717', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', label: 'Absent' },
  LATE: { icon: '\u25F7', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30', label: 'Late' },
  EXCUSED: { icon: '\u2014', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50', label: 'Excused' },
};

export default function TeacherAttendancePage() {
  const { token } = useAuthStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');

  // Mark tab state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<Record<string, { status: string; note: string }>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // History tab state
  const [historyMonth, setHistoryMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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

  // Fetch students + existing attendance when course or date changes (mark tab)
  useEffect(() => {
    if (!token || !selectedCourse || activeTab !== 'mark') return;
    Promise.all([
      fetch(`${API_URL}/api/teacher/courses/${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/api/teacher/courses/${selectedCourse}/attendance?date=${selectedDate}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([courseData, attendanceData]) => {
      const studs = courseData.success ? courseData.data.students || [] : [];
      setStudents(studs);

      const existingMap = new Map<string, { status: string; note: string }>(
        (attendanceData.data || []).map((a: any) => [a.studentId, { status: a.status, note: a.note || '' }])
      );
      const initRecords: Record<string, { status: string; note: string }> = {};
      studs.forEach((s: any) => {
        initRecords[s.student.id] = existingMap.get(s.student.id) ?? { status: 'PRESENT', note: '' };
      });
      setRecords(initRecords);
    });
  }, [token, selectedCourse, selectedDate, activeTab]);

  // Fetch history data when course or month changes (history tab)
  useEffect(() => {
    if (!token || !selectedCourse || activeTab !== 'history') return;
    setHistoryLoading(true);

    const [year, month] = historyMonth.split('-').map(Number);
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    fetch(`${API_URL}/api/teacher/courses/${selectedCourse}/attendance?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setHistoryData(d.data || []);
      })
      .finally(() => setHistoryLoading(false));
  }, [token, selectedCourse, historyMonth, activeTab]);

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

  // Build history grid: students x dates
  const historyGrid = useMemo(() => {
    if (historyData.length === 0) return { students: [], dates: [], grid: new Map() };

    // Collect unique students and dates
    const studentsMap = new Map<string, { id: string; name: string; email: string }>();
    const datesSet = new Set<string>();

    historyData.forEach((rec: any) => {
      if (rec.student) {
        studentsMap.set(rec.studentId, { id: rec.student.id, name: rec.student.name, email: rec.student.email });
      }
      const dateStr = new Date(rec.date).toISOString().split('T')[0];
      datesSet.add(dateStr);
    });

    const studentsList = Array.from(studentsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    const datesList = Array.from(datesSet).sort();

    // Build grid: studentId -> date -> status
    const grid = new Map<string, Map<string, string>>();
    historyData.forEach((rec: any) => {
      const dateStr = new Date(rec.date).toISOString().split('T')[0];
      if (!grid.has(rec.studentId)) grid.set(rec.studentId, new Map());
      grid.get(rec.studentId)!.set(dateStr, rec.status);
    });

    return { students: studentsList, dates: datesList, grid };
  }, [historyData]);

  // Compute stats per student
  const getStudentStats = (studentId: string) => {
    const studentGrid = historyGrid.grid.get(studentId);
    if (!studentGrid) return { present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0 };

    let present = 0, absent = 0, late = 0, excused = 0;
    studentGrid.forEach((status: string) => {
      if (status === 'PRESENT') present++;
      else if (status === 'ABSENT') absent++;
      else if (status === 'LATE') late++;
      else if (status === 'EXCUSED') excused++;
    });
    const total = present + absent + late + excused;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { present, absent, late, excused, total, rate };
  };

  const changeMonth = (dir: number) => {
    const [year, month] = historyMonth.split('-').map(Number);
    const d = new Date(year, month - 1 + dir, 1);
    setHistoryMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const monthLabel = useMemo(() => {
    const [year, month] = historyMonth.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [historyMonth]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
      </div>

      {/* Course selector */}
      <div className="max-w-xs">
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('mark')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'mark'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Mark Attendance
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <History className="w-4 h-4" /> History
        </button>
      </div>

      {/* ======================== MARK TAB ======================== */}
      {activeTab === 'mark' && (
        <div className="space-y-6 max-w-4xl">
          {/* Date + Quick actions */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Mark all:</span>
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
      )}

      {/* ======================== HISTORY TAB ======================== */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Month navigation */}
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-gray-900 dark:text-white min-w-[160px] text-center">
              {monthLabel}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {historyLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : historyGrid.students.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No attendance records for this month</p>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs">
                {Object.entries(STATUS_CELL).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded ${val.bg} ${val.color} font-bold text-xs`}>
                      {val.icon}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{val.label}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 font-bold text-xs">-</span>
                  <span className="text-gray-600 dark:text-gray-400">No record</span>
                </div>
              </div>

              {/* History table */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky left-0 bg-white dark:bg-gray-900 z-10 min-w-[180px]">
                          Student
                        </th>
                        {historyGrid.dates.map((date) => {
                          const d = new Date(date + 'T00:00:00');
                          const day = d.getDate();
                          const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                          return (
                            <th key={date} className="text-center px-1 py-2 min-w-[40px]">
                              <div className="text-[10px] text-gray-400 dark:text-gray-500">{weekday}</div>
                              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{day}</div>
                            </th>
                          );
                        })}
                        <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase sticky right-0 bg-white dark:bg-gray-900 z-10 min-w-[60px]">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyGrid.students.map((student) => {
                        const stats = getStudentStats(student.id);
                        const studentDateMap = historyGrid.grid.get(student.id);
                        return (
                          <tr key={student.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                            <td className="px-4 py-2 sticky left-0 bg-white dark:bg-gray-900 z-10">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                  {student.name?.charAt(0) || 'S'}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{student.name}</p>
                                </div>
                              </div>
                            </td>
                            {historyGrid.dates.map((date) => {
                              const status = studentDateMap?.get(date);
                              const cell = status ? STATUS_CELL[status] : null;
                              return (
                                <td key={date} className="text-center px-1 py-2">
                                  {cell ? (
                                    <span
                                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${cell.bg} ${cell.color} font-bold text-xs`}
                                      title={`${cell.label} - ${new Date(date + 'T00:00:00').toLocaleDateString()}`}
                                    >
                                      {cell.icon}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-gray-200 dark:text-gray-700 text-xs">
                                      -
                                    </span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="text-center px-3 py-2 sticky right-0 bg-white dark:bg-gray-900 z-10">
                              <span className={`text-xs font-bold ${
                                stats.rate >= 80 ? 'text-green-600 dark:text-green-400' :
                                stats.rate >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {stats.rate}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Records', value: historyData.length, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                  { label: 'Present', value: historyData.filter((r: any) => r.status === 'PRESENT').length, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
                  { label: 'Absent', value: historyData.filter((r: any) => r.status === 'ABSENT').length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                  { label: 'Late', value: historyData.filter((r: any) => r.status === 'LATE').length, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
