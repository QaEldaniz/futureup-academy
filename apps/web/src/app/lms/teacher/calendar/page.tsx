'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, X, Plus } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CalEvent { id: string; title: string; date: string; time: string | null; endTime: string | null; type: 'lesson' | 'assignment' | 'quiz'; courseTitle: string; courseId: string; color: string; room?: string; }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPE_LABELS: Record<string, string> = { lesson: 'Lesson', assignment: 'Assignment Due', quiz: 'Quiz' };

export default function TeacherCalendarPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const to = new Date(year, month + 2, 0).toISOString().slice(0, 10);
    fetch(`${API_URL}/api/calendar/events?from=${from}&to=${to}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(j => { if (j.success) setEvents(j.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, [token, year, month]);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return events;
    return events.filter(e => e.type === filterType);
  }, [events, filterType]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = new Date().toISOString().slice(0, 10);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    filteredEvents.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    return map;
  }, [filteredEvents]);

  const calDays = useMemo(() => {
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const dateStr = `${year}-${String(month + 2).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false });
    }
    return days;
  }, [year, month, daysInMonth, firstDayOfWeek]);

  const navigate = (dir: number) => setCurrentDate(new Date(year, month + dir, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayEvents = selectedDay ? (eventsByDate[selectedDay] || []) : [];

  // Stats
  const stats = useMemo(() => {
    const thisMonth = filteredEvents.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === month && d.getFullYear() === year;
    });
    return {
      total: thisMonth.length,
      lessons: thisMonth.filter(e => e.type === 'lesson').length,
      assignments: thisMonth.filter(e => e.type === 'assignment').length,
      quizzes: thisMonth.filter(e => e.type === 'quiz').length,
    };
  }, [filteredEvents, month, year]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teaching Calendar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your lessons, assignment deadlines, and quizzes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: stats.total, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
          { label: 'Lessons', value: stats.lessons, color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' },
          { label: 'Assignments', value: stats.assignments, color: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' },
          { label: 'Quizzes', value: stats.quizzes, color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white min-w-[180px] text-center">{monthName}</h2>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" /></button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">Today</button>
            <div className="flex gap-1">
              {(['month', 'week'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend + Filter */}
        <div className="flex items-center justify-between px-6 py-2 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Lessons</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Assignments</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Quizzes</span>
          </div>
          <div className="flex gap-1">
            {[{ key: 'all', label: 'All' }, { key: 'lesson', label: 'Lessons' }, { key: 'assignment', label: 'Assignments' }, { key: 'quiz', label: 'Quizzes' }].map(f => (
              <button key={f.key} onClick={() => setFilterType(f.key)}
                className={`px-2 py-1 text-xs font-medium rounded-lg ${filterType === f.key ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="p-4">
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calDays.map((cd, i) => {
                const dayEvts = eventsByDate[cd.date] || [];
                const isToday = cd.date === today;
                const isSelected = cd.date === selectedDay;
                return (
                  <button key={i} onClick={() => setSelectedDay(isSelected ? null : cd.date)}
                    className={`min-h-[80px] p-1.5 rounded-xl text-left transition-all border ${
                      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' :
                      isToday ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' :
                      cd.isCurrentMonth ? 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50' :
                      'border-transparent opacity-40'
                    }`}>
                    <span className={`text-xs font-medium ${isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : cd.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                      {cd.day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayEvts.slice(0, 3).map(e => (
                        <div key={e.id} onClick={(ev) => { ev.stopPropagation(); setSelectedEvent(e); }}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: e.color + '20', color: e.color }}>
                          {e.time ? `${e.time} ` : ''}{e.title}
                        </div>
                      ))}
                      {dayEvts.length > 3 && <div className="text-[10px] text-gray-400 pl-1">+{dayEvts.length - 3} more</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Day Detail */}
      {selectedDay && dayEvents.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
            <button onClick={() => setSelectedDay(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            {dayEvents.sort((a, b) => (a.time || 'z').localeCompare(b.time || 'z')).map(e => (
              <div key={e.id} onClick={() => setSelectedEvent(e)} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.title}</p>
                  <p className="text-xs text-gray-500">{e.courseTitle} {TYPE_LABELS[e.type] && `\u00b7 ${TYPE_LABELS[e.type]}`}</p>
                </div>
                <div className="text-right">
                  {e.time && <p className="text-sm font-medium text-gray-900 dark:text-white">{e.time}{e.endTime ? ` - ${e.endTime}` : ''}</p>}
                  {e.room && <p className="text-xs text-gray-400">{e.room}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: selectedEvent.color + '20', color: selectedEvent.color }}>{TYPE_LABELS[selectedEvent.type]}</span>
              <button onClick={() => setSelectedEvent(null)} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{selectedEvent.title}</h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Course:</span> {selectedEvent.courseTitle}</p>
              <p><span className="font-medium">Date:</span> {new Date(selectedEvent.date + 'T00:00:00').toLocaleDateString()}</p>
              {selectedEvent.time && <p><span className="font-medium">Time:</span> {selectedEvent.time}{selectedEvent.endTime ? ` - ${selectedEvent.endTime}` : ''}</p>}
              {selectedEvent.room && <p><span className="font-medium">Room:</span> {selectedEvent.room}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
