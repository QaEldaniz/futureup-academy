'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/auth';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface CalEvent { id: string; title: string; date: string; time: string | null; endTime: string | null; type: 'lesson' | 'assignment' | 'quiz'; courseTitle: string; courseId: string; color: string; room?: string; }

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TYPE_LABELS: Record<string, string> = { lesson: 'Lesson', assignment: 'Assignment Due', quiz: 'Quiz' };

export default function StudentCalendarPage() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [loading, setLoading] = useState(true);

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

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon=0
  const today = new Date().toISOString().slice(0, 10);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    events.forEach(e => { if (!map[e.date]) map[e.date] = []; map[e.date].push(e); });
    return map;
  }, [events]);

  const calDays = useMemo(() => {
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: true });
    }
    // Next month padding
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your schedule, assignments, and quizzes</p>
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

        {/* Legend */}
        <div className="flex items-center gap-4 px-6 py-2 text-xs border-b border-gray-50 dark:border-gray-800">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Lessons</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Assignments</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Quizzes</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          /* Month Grid */
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
                      isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' :
                      isToday ? 'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10' :
                      cd.isCurrentMonth ? 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50' :
                      'border-transparent opacity-40'
                    }`}>
                    <span className={`text-xs font-medium ${isToday ? 'bg-primary-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : cd.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
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
              <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="w-1 h-12 rounded-full" style={{ backgroundColor: e.color }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{e.title}</p>
                  <p className="text-xs text-gray-500">{e.courseTitle} {TYPE_LABELS[e.type] && `· ${TYPE_LABELS[e.type]}`}</p>
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
