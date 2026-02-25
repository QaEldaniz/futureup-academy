'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  BookOpen,
  User,
  X,
  Save,
  Loader2,
  Inbox,
  RefreshCw,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  titleAz?: string;
  titleRu?: string;
  titleEn?: string;
  name?: string;
}

interface Teacher {
  id: string;
  nameAz?: string;
  nameRu?: string;
  nameEn?: string;
  name?: string;
}

interface Schedule {
  id: string;
  courseId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  isActive: boolean;
  course?: Course;
  teacher?: Teacher;
  createdAt?: string;
}

interface ScheduleForm {
  courseId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  isActive: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => {
  const hour = 9 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const SLOT_COLORS = [
  'bg-primary-500/20 border-primary-500/30 text-primary-300',
  'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  'bg-secondary-500/20 border-secondary-500/30 text-secondary-300',
  'bg-amber-500/20 border-amber-500/30 text-amber-300',
  'bg-rose-500/20 border-rose-500/30 text-rose-300',
  'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
  'bg-accent-500/20 border-accent-500/30 text-accent-300',
  'bg-orange-500/20 border-orange-500/30 text-orange-300',
];

const emptyForm: ScheduleForm = {
  courseId: '',
  teacherId: '',
  dayOfWeek: 1,
  startTime: '09:00',
  endTime: '10:00',
  room: '',
  isActive: true,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCourseName(course?: Course): string {
  return course?.titleAz || course?.titleEn || course?.name || 'Unknown Course';
}

function getTeacherName(teacher?: Teacher): string {
  return teacher?.nameAz || teacher?.nameEn || teacher?.name || 'Unknown Teacher';
}

function getCourseColor(courseId: string, courseIds: string[]): string {
  const index = courseIds.indexOf(courseId);
  return SLOT_COLORS[index % SLOT_COLORS.length];
}

function parseHour(time: string): number {
  return parseInt(time.split(':')[0], 10);
}

function formatTime(time: string): string {
  return time.slice(0, 5);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminSchedulePage() {
  const { token } = useAuthStore();

  // Data state
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    id?: string;
    form: ScheduleForm;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ─── Fetch Data ─────────────────────────────────────────────────────────

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: Schedule[] }>(
        '/admin/schedules',
        { token: token || undefined }
      );
      if (res.success) {
        setSchedules(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: Course[] }>(
        '/admin/courses',
        { token: token || undefined }
      );
      if (res.success) {
        setCourses(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  }, [token]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: Teacher[] }>(
        '/admin/teachers',
        { token: token || undefined }
      );
      if (res.success) {
        setTeachers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchSchedules();
    fetchCourses();
    fetchTeachers();
  }, [fetchSchedules, fetchCourses, fetchTeachers]);

  // ─── Derived Data ───────────────────────────────────────────────────────

  const uniqueCourseIds = [...new Set(schedules.map((s) => s.courseId))];

  // ─── CRUD ───────────────────────────────────────────────────────────────

  function openAddModal() {
    setModal({
      mode: 'add',
      form: {
        ...emptyForm,
        courseId: courses[0]?.id || '',
        teacherId: teachers[0]?.id || '',
      },
    });
    setFormError('');
  }

  function openEditModal(schedule: Schedule) {
    setModal({
      mode: 'edit',
      id: schedule.id,
      form: {
        courseId: schedule.courseId,
        teacherId: schedule.teacherId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: formatTime(schedule.startTime),
        endTime: formatTime(schedule.endTime),
        room: schedule.room,
        isActive: schedule.isActive,
      },
    });
    setFormError('');
  }

  async function handleSave() {
    if (!modal) return;
    if (!modal.form.courseId) {
      setFormError('Course is required');
      return;
    }
    if (!modal.form.teacherId) {
      setFormError('Teacher is required');
      return;
    }
    if (!modal.form.room.trim()) {
      setFormError('Room is required');
      return;
    }
    if (!modal.form.startTime || !modal.form.endTime) {
      setFormError('Start and end times are required');
      return;
    }
    if (modal.form.startTime >= modal.form.endTime) {
      setFormError('End time must be after start time');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = { ...modal.form };

      if (modal.mode === 'add') {
        const res = await api.post<{ success: boolean; data: Schedule }>(
          '/admin/schedules',
          payload,
          { token: token || undefined }
        );
        if (res.success) {
          setSchedules((prev) => [...prev, res.data]);
          setModal(null);
        }
      } else {
        const res = await api.put<{ success: boolean; data: Schedule }>(
          `/admin/schedules/${modal.id}`,
          payload,
          { token: token || undefined }
        );
        if (res.success) {
          setSchedules((prev) =>
            prev.map((s) => (s.id === modal.id ? { ...s, ...res.data } : s))
          );
          setModal(null);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save schedule';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await api.delete(`/admin/schedules/${id}`, { token: token || undefined });
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete schedule:', err);
    } finally {
      setDeletingId(null);
    }
  }

  // ─── Timetable Helpers ─────────────────────────────────────────────────

  function getSchedulesForSlot(day: number, hour: number): Schedule[] {
    return schedules.filter((s) => {
      const startHour = parseHour(s.startTime);
      const endHour = parseHour(s.endTime);
      return s.dayOfWeek === day && startHour <= hour && endHour > hour;
    });
  }

  function isSlotStart(schedule: Schedule, hour: number): boolean {
    return parseHour(schedule.startTime) === hour;
  }

  function getSlotSpan(schedule: Schedule): number {
    return parseHour(schedule.endTime) - parseHour(schedule.startTime);
  }

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-gray-400 mt-1">
            Manage weekly class timetable and schedule entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchSchedules(); fetchCourses(); fetchTeachers(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:border-gray-700/50 transition-all"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </button>
          <button
            onClick={openAddModal}
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
              'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
              'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
              'active:scale-[0.98]'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Schedule
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* WEEKLY TIMETABLE GRID                                              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800/50">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-400" />
            Weekly Timetable
          </h2>
        </div>

        {loading ? (
          <div className="p-6">
            <div className="h-96 bg-gray-100 dark:bg-gray-800/30 rounded-xl animate-pulse" />
          </div>
        ) : (
          <div className="p-4 overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
                <div className="p-2" />
                {DAYS_OF_WEEK.map((day) => (
                  <div
                    key={day.value}
                    className="p-2 text-center text-xs font-semibold text-gray-300 bg-gray-100 dark:bg-gray-800/30 rounded-lg"
                  >
                    <span className="hidden sm:inline">{day.label}</span>
                    <span className="sm:hidden">{day.short}</span>
                  </div>
                ))}
              </div>

              {/* Time rows */}
              {TIME_SLOTS.map((time, timeIndex) => {
                const hour = 9 + timeIndex;
                return (
                  <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] gap-1 mb-1">
                    {/* Time label */}
                    <div className="p-2 flex items-start justify-end pr-3">
                      <span className="text-xs text-gray-500 font-medium">{time}</span>
                    </div>

                    {/* Day cells */}
                    {DAYS_OF_WEEK.map((day) => {
                      const slotSchedules = getSchedulesForSlot(day.value, hour);
                      const startsHere = slotSchedules.filter((s) => isSlotStart(s, hour));
                      const continuesHere = slotSchedules.filter((s) => !isSlotStart(s, hour));

                      return (
                        <div
                          key={`${day.value}-${hour}`}
                          className={cn(
                            'min-h-[48px] rounded-lg border border-gray-800/20 relative',
                            slotSchedules.length === 0 && 'bg-gray-900/20 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:bg-gray-800/20 transition-colors'
                          )}
                        >
                          {startsHere.map((schedule) => {
                            const span = getSlotSpan(schedule);
                            const colorClass = getCourseColor(schedule.courseId, uniqueCourseIds);
                            return (
                              <div
                                key={schedule.id}
                                className={cn(
                                  'absolute inset-x-0 top-0 rounded-lg border p-1.5 z-10 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden',
                                  colorClass
                                )}
                                style={{ height: `calc(${span * 100}% + ${(span - 1) * 4}px)` }}
                                onClick={() => openEditModal(schedule)}
                                title={`${getCourseName(schedule.course)} - ${getTeacherName(schedule.teacher)}`}
                              >
                                <p className="text-[10px] font-semibold truncate leading-tight">
                                  {getCourseName(schedule.course)}
                                </p>
                                <p className="text-[9px] opacity-80 truncate leading-tight mt-0.5">
                                  {getTeacherName(schedule.teacher)}
                                </p>
                                {span > 1 && (
                                  <>
                                    <p className="text-[9px] opacity-70 truncate leading-tight mt-0.5 flex items-center gap-0.5">
                                      <MapPin className="w-2 h-2 shrink-0" />
                                      {schedule.room}
                                    </p>
                                    <p className="text-[9px] opacity-70 truncate leading-tight mt-0.5 flex items-center gap-0.5">
                                      <Clock className="w-2 h-2 shrink-0" />
                                      {formatTime(schedule.startTime)}-{formatTime(schedule.endTime)}
                                    </p>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          {startsHere.length === 0 && continuesHere.length > 0 && (
                            <div className="absolute inset-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* SCHEDULE LIST TABLE                                                */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary-400" />
            All Schedules
          </h2>
          <span className="text-xs text-gray-500">
            {schedules.length} {schedules.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-800/30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                </div>
                <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No schedules yet</p>
            <p className="text-gray-500 text-sm mt-1">
              Add your first schedule entry to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 dark:border-gray-800/50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-1">Day</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-3">Course</div>
              <div className="col-span-2">Teacher</div>
              <div className="col-span-1">Room</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2">Actions</div>
            </div>

            <div className="divide-y divide-gray-800/30">
              {schedules
                .sort((a, b) => {
                  if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
                  return a.startTime.localeCompare(b.startTime);
                })
                .map((schedule) => {
                  const dayInfo = DAYS_OF_WEEK.find((d) => d.value === schedule.dayOfWeek);
                  return (
                    <div
                      key={schedule.id}
                      className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 dark:bg-gray-800/20 transition-colors"
                    >
                      {/* Day */}
                      <div className="col-span-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {dayInfo?.short || `Day ${schedule.dayOfWeek}`}
                        </span>
                      </div>

                      {/* Time */}
                      <div className="col-span-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-gray-500 hidden lg:block" />
                        <span className="text-sm text-gray-300">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </span>
                      </div>

                      {/* Course */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-primary-400" />
                        </div>
                        <span className="text-sm text-gray-300 truncate">
                          {getCourseName(schedule.course)}
                        </span>
                      </div>

                      {/* Teacher */}
                      <div className="col-span-2 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-gray-500 hidden lg:block" />
                        <span className="text-sm text-gray-300 truncate">
                          {getTeacherName(schedule.teacher)}
                        </span>
                      </div>

                      {/* Room */}
                      <div className="col-span-1 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-500 hidden lg:block" />
                        <span className="text-sm text-gray-300">{schedule.room}</span>
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[10px] font-medium border',
                            schedule.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                          )}
                        >
                          {schedule.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(schedule)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(schedule.id)}
                          disabled={deletingId === schedule.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ADD / EDIT SCHEDULE MODAL                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141927] border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800/50 sticky top-0 bg-white dark:bg-[#141927] z-10">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                {modal.mode === 'add' ? 'Add Schedule' : 'Edit Schedule'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {formError}
                </div>
              )}

              {/* Course */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Course <span className="text-red-400">*</span>
                </label>
                <select
                  value={modal.form.courseId}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, courseId: e.target.value } })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-[#141927] text-gray-500 dark:text-gray-400">
                    Select a course
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} className="bg-white dark:bg-[#141927] text-gray-900 dark:text-white">
                      {getCourseName(course)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teacher <span className="text-red-400">*</span>
                </label>
                <select
                  value={modal.form.teacherId}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, teacherId: e.target.value } })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-white dark:bg-[#141927] text-gray-500 dark:text-gray-400">
                    Select a teacher
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id} className="bg-white dark:bg-[#141927] text-gray-900 dark:text-white">
                      {getTeacherName(teacher)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Day of Week <span className="text-red-400">*</span>
                </label>
                <select
                  value={modal.form.dayOfWeek}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      form: { ...modal.form, dayOfWeek: parseInt(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value} className="bg-white dark:bg-[#141927] text-gray-900 dark:text-white">
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time & End Time row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={modal.form.startTime}
                    onChange={(e) =>
                      setModal({ ...modal, form: { ...modal.form, startTime: e.target.value } })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    value={modal.form.endTime}
                    onChange={(e) =>
                      setModal({ ...modal, form: { ...modal.form, endTime: e.target.value } })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Room & Active row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Room <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={modal.form.room}
                    onChange={(e) =>
                      setModal({ ...modal, form: { ...modal.form, room: e.target.value } })
                    }
                    placeholder="e.g. A-101"
                    className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-200 dark:border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({
                        ...modal,
                        form: { ...modal.form, isActive: !modal.form.isActive },
                      })
                    }
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border text-sm font-medium transition-all text-left',
                      modal.form.isActive
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-gray-900/50 border-gray-200 dark:border-gray-700/50 text-gray-400'
                    )}
                  >
                    {modal.form.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800/50 sticky bottom-0 bg-white dark:bg-[#141927]">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
                  'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
                  'shadow-lg shadow-primary-500/25',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DELETE CONFIRMATION MODAL                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#141927] border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Delete Schedule</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Are you sure you want to delete this schedule entry? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:text-white text-sm font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  disabled={deletingId === deleteConfirm}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
                    'bg-red-600 hover:bg-red-700',
                    'shadow-lg shadow-red-500/25',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {deletingId === deleteConfirm ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deletingId === deleteConfirm ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
