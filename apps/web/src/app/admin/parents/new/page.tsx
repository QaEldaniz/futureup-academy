'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function NewParentPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({
    nameAz: '', nameRu: '', nameEn: '',
    email: '', password: '', phone: '',
    childrenIds: [] as { studentId: string; relation: string }[],
  });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/students?limit=200`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudents(d.data || []); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/parents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.message || 'Error'); setSaving(false); return; }
      router.push('/admin/parents');
    } catch (e) { setError('Network error'); }
    setSaving(false);
  };

  const addChild = () => {
    setForm({ ...form, childrenIds: [...form.childrenIds, { studentId: '', relation: 'PARENT' }] });
  };

  const removeChild = (index: number) => {
    setForm({ ...form, childrenIds: form.childrenIds.filter((_, i) => i !== index) });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => router.push('/admin/parents')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Parents
      </button>
      <h1 className="text-2xl font-bold text-white">New Parent</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-dark rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Personal Info</h2>
          {['Az', 'Ru', 'En'].map((lang) => (
            <div key={lang}>
              <label className="block text-sm text-gray-400 mb-1">Name ({lang}){lang === 'Az' ? ' *' : ''}</label>
              <input
                value={(form as any)[`name${lang}`]}
                onChange={(e) => setForm({ ...form, [`name${lang}`]: e.target.value })}
                required={lang === 'Az'}
                className="w-full px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email *</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password *</label>
            <input
              type="password" required value={form.password} minLength={6}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Children linking */}
        <div className="bg-surface-dark rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Link Children</h2>
            <button type="button" onClick={addChild} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300">
              <Plus className="w-4 h-4" /> Add Child
            </button>
          </div>
          {form.childrenIds.map((child, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={child.studentId}
                onChange={(e) => {
                  const updated = [...form.childrenIds];
                  updated[i] = { ...updated[i], studentId: e.target.value };
                  setForm({ ...form, childrenIds: updated });
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select student...</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>
              <select
                value={child.relation}
                onChange={(e) => {
                  const updated = [...form.childrenIds];
                  updated[i] = { ...updated[i], relation: e.target.value };
                  setForm({ ...form, childrenIds: updated });
                }}
                className="w-32 px-3 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none"
              >
                <option value="PARENT">Parent</option>
                <option value="MOTHER">Mother</option>
                <option value="FATHER">Father</option>
                <option value="GUARDIAN">Guardian</option>
              </select>
              <button type="button" onClick={() => removeChild(i)} className="p-2 text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-900/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Create Parent'}
        </button>
      </form>
    </div>
  );
}
