'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 09:00 - 21:00

const COURSE_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  { bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
  { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
];

interface ScheduleEntry {
  id: string;
  dayOfWeek: number; // 1=Monday ... 6=Saturday
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  room: string;
  course: {
    id: string;
    titleEn: string;
    titleAz?: string;
  };
  teacher: {
    id: string;
    nameEn: string;
    nameAz?: string;
  };
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h + m / 60;
}

function formatHour(hour: number): string {
  return `${hour.toString().padStart(2, '0')}:00`;
}

function getTodayDayIndex(): number {
  const jsDay = new Date().getDay(); // 0=Sun, 1=Mon...6=Sat
  return jsDay === 0 ? -1 : jsDay; // -1 for Sunday (not on grid)
}

export default function TeacherSchedulePage() {
  const { token } = useAuthStore();
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch(`${API_URL}/api/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load schedule (${r.status})`);
        return r.json();
      })
      .then((d) => {
        if (d.success) {
          setSchedules(d.data || []);
        } else {
          throw new Error(d.message || 'Failed to load schedule');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const todayIndex = getTodayDayIndex();

  const courseColorMap = useMemo(() => {
    const uniqueCourseIds = [...new Set(schedules.map((s) => s.course.id))];
    const map: Record<string, typeof COURSE_COLORS[number]> = {};
    uniqueCourseIds.forEach((id, i) => {
      map[id] = COURSE_COLORS[i % COURSE_COLORS.length];
    });
    return map;
  }, [schedules]);

  const scheduleByDay = useMemo(() => {
    const map: Record<number, ScheduleEntry[]> = {};
    for (const day of [1, 2, 3, 4, 5, 6]) {
      map[day] = schedules
        .filter((s) => s.dayOfWeek === day)
        .sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));
    }
    return map;
  }, [schedules]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Teaching Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your weekly teaching timetable</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Teaching Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your weekly teaching timetable</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Calendar className="w-12 h-12 text-red-400 dark:text-red-500 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Failed to load schedule</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (schedules.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Teaching Schedule</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your weekly teaching timetable</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No schedule available</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your teaching schedule will appear here once classes are assigned
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Teaching Schedule</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your weekly teaching timetable</p>
      </div>

      {/* Desktop: Weekly timetable grid */}
      <div className="hidden lg:block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-gray-200 dark:border-gray-800">
              <div className="p-3 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Time
              </div>
              {DAYS.map((day, idx) => {
                const dayNum = idx + 1;
                const isToday = dayNum === todayIndex;
                return (
                  <div
                    key={day}
                    className={`p-3 text-center text-sm font-semibold border-l border-gray-100 dark:border-gray-800 ${
                      isToday
                        ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-700 dark:text-primary-300 border-b-2 border-b-primary-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {day}
                    {isToday && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                        Today
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time rows */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-gray-50 dark:border-gray-800/50 min-h-[64px]"
              >
                <div className="p-2 text-xs text-gray-400 dark:text-gray-500 font-medium text-right pr-3 pt-3">
                  {formatHour(hour)}
                </div>
                {DAYS.map((_, dayIdx) => {
                  const dayNum = dayIdx + 1;
                  const isToday = dayNum === todayIndex;
                  const entriesInSlot = scheduleByDay[dayNum]?.filter((entry) => {
                    const start = parseTime(entry.startTime);
                    return Math.floor(start) === hour;
                  }) || [];

                  return (
                    <div
                      key={dayIdx}
                      className={`border-l border-gray-100 dark:border-gray-800 p-1 relative ${
                        isToday ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''
                      }`}
                    >
                      {entriesInSlot.map((entry) => {
                        const colors = courseColorMap[entry.course.id];
                        const startH = parseTime(entry.startTime);
                        const endH = parseTime(entry.endTime);
                        const duration = endH - startH;
                        const offsetMin = (startH - hour) * 60;
                        return (
                          <div
                            key={entry.id}
                            className={`${colors.bg} ${colors.border} border rounded-lg p-2 text-xs absolute left-1 right-1 overflow-hidden cursor-default hover:shadow-md transition-shadow z-10`}
                            style={{
                              top: `${(offsetMin / 60) * 64 + 4}px`,
                              height: `${Math.max(duration * 64 - 8, 24)}px`,
                            }}
                            title={`${entry.course.titleEn} - ${entry.startTime} to ${entry.endTime}`}
                          >
                            <p className={`font-semibold ${colors.text} truncate leading-tight`}>
                              {entry.course.titleEn}
                            </p>
                            {duration >= 1 && (
                              <>
                                <p className="text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                  {entry.teacher.nameEn}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 text-gray-400 dark:text-gray-500">
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-3 h-3" />
                                    {entry.room}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-3 h-3" />
                                    {entry.startTime}-{entry.endTime}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Stacked days */}
      <div className="lg:hidden space-y-4">
        {DAYS.map((day, idx) => {
          const dayNum = idx + 1;
          const isToday = dayNum === todayIndex;
          const dayEntries = scheduleByDay[dayNum] || [];

          return (
            <div
              key={day}
              className={`bg-white dark:bg-gray-900 rounded-2xl border overflow-hidden ${
                isToday
                  ? 'border-primary-300 dark:border-primary-700 ring-1 ring-primary-200 dark:ring-primary-800'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div
                className={`px-4 py-3 border-b ${
                  isToday
                    ? 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${isToday ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </h3>
                  {isToday && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      Today
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3 space-y-2">
                {dayEntries.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3">No classes</p>
                ) : (
                  dayEntries.map((entry) => {
                    const colors = courseColorMap[entry.course.id];
                    return (
                      <div
                        key={entry.id}
                        className={`${colors.bg} ${colors.border} border rounded-xl p-3`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className={`font-semibold text-sm ${colors.text} truncate`}>
                              {entry.course.titleEn}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {entry.teacher.nameEn}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {entry.startTime}-{entry.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {entry.room}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Course legend */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Courses
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(courseColorMap).map(([courseId, colors]) => {
            const entry = schedules.find((s) => s.course.id === courseId);
            if (!entry) return null;
            return (
              <div key={courseId} className="flex items-center gap-2 text-sm">
                <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
                <span className="text-gray-600 dark:text-gray-400">{entry.course.titleEn}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
