'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { Award, Plus, X, Save, Loader2, Filter } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const GRADE_TYPES = ['ASSIGNMENT', 'QUIZ', 'EXAM', 'PROJECT', 'PARTICIPATION'];
const TYPE_COLORS: Record<string, string> = {
  ASSIGNMENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  QUIZ: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400',
  EXAM: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PROJECT: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PARTICIPATION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function TeacherGradesPage() {
  const { token } = useAuthStore();
  const { t, tField } = useLmsT();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grades, setGrades] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    studentId: '', value: '', maxValue: '100', type: 'ASSIGNMENT', comment: '',
  });

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

  useEffect(() => {
    if (!token || !selectedCourse) return;
    const typeParam = filterType ? `&type=${filterType}` : '';
    Promise.all([
      fetch(`${API_URL}/api/teacher/courses/${selectedCourse}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/api/teacher/courses/${selectedCourse}/grades?${typeParam}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([courseData, gradesData]) => {
      if (courseData.success) setStudents(courseData.data.students || []);
      if (gradesData.success) setGrades(gradesData.data || []);
    });
  }, [token, selectedCourse, filterType]);

  const handleAddGrade = async () => {
    if (!gradeForm.studentId || !gradeForm.value) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/teacher/courses/${selectedCourse}/grades`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: gradeForm.studentId,
          value: parseFloat(gradeForm.value),
          maxValue: parseFloat(gradeForm.maxValue) || 100,
          type: gradeForm.type,
          comment: gradeForm.comment || undefined,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setGrades([d.data, ...grades]);
        setShowModal(false);
        setGradeForm({ studentId: '', value: '', maxValue: '100', type: 'ASSIGNMENT', comment: '' });
      }
    } catch {}
    setSaving(false);
  };

  // Group grades by student for summary
  const studentGradeMap = new Map<string, { grades: any[]; avg: number }>();
  grades.forEach((g) => {
    const existing = studentGradeMap.get(g.studentId) || { grades: [], avg: 0 };
    existing.grades.push(g);
    studentGradeMap.set(g.studentId, existing);
  });
  studentGradeMap.forEach((val) => {
    val.avg = val.grades.length > 0
      ? Math.round((val.grades.reduce((s, g) => s + (g.value / g.maxValue) * 100, 0) / val.grades.length) * 10) / 10
      : 0;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3 animate-pulse" />
        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('navGrades')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> {t('addGrade')}
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('course')}</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{tField(c, 'title')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('typeFilter')}</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">{t('allTypes')}</option>
            {GRADE_TYPES.map((gt) => (
              <option key={gt} value={gt}>{gt.charAt(0) + gt.slice(1).toLowerCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student averages */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {students.map((s) => {
            const info = studentGradeMap.get(s.student.id);
            const avg = info?.avg || 0;
            const count = info?.grades.length || 0;
            return (
              <div key={s.student.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                  {s.student.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{tField(s.student, 'name')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{count} {t('grades')}</p>
                </div>
                <div className={`text-lg font-bold ${avg >= 80 ? 'text-green-500' : avg >= 60 ? 'text-yellow-500' : avg > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {avg > 0 ? `${avg}%` : '—'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grades list */}
      {grades.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('noGradesYet')}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('student')}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('score')}</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('type')}</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('comment')}</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 dark:border-gray-800/50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tField(g.student, 'name')}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${
                        (g.value / g.maxValue) * 100 >= 80 ? 'text-green-500' :
                        (g.value / g.maxValue) * 100 >= 60 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {g.value}/{g.maxValue}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[g.type] || ''}`}>
                        {g.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{g.comment || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-xs text-gray-500">{new Date(g.createdAt).toLocaleDateString()}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Grade Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('addGrade')}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('student')}</label>
              <select
                value={gradeForm.studentId}
                onChange={(e) => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
              >
                <option value="">{t('selectStudent2')}</option>
                {students.map((s) => (
                  <option key={s.student.id} value={s.student.id}>{tField(s.student, 'name')}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('score')}</label>
                <input
                  type="number" min="0" step="0.5"
                  value={gradeForm.value}
                  onChange={(e) => setGradeForm({ ...gradeForm, value: e.target.value })}
                  placeholder="85"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('maxScore')}</label>
                <input
                  type="number" min="1"
                  value={gradeForm.maxValue}
                  onChange={(e) => setGradeForm({ ...gradeForm, maxValue: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('type')}</label>
              <select
                value={gradeForm.type}
                onChange={(e) => setGradeForm({ ...gradeForm, type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none"
              >
                {GRADE_TYPES.map((gt) => (
                  <option key={gt} value={gt}>{gt.charAt(0) + gt.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t('commentOptional')}</label>
              <textarea
                value={gradeForm.comment}
                onChange={(e) => setGradeForm({ ...gradeForm, comment: e.target.value })}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm outline-none resize-none"
              />
            </div>

            <button
              onClick={handleAddGrade}
              disabled={saving || !gradeForm.studentId || !gradeForm.value}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? t('saving') : t('saveGrade')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
