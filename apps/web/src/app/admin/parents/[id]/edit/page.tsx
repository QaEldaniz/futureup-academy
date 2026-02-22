'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { ArrowLeft, Save, Plus, X, Link2, Unlink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function EditParentPage() {
  const router = useRouter();
  const params = useParams();
  const parentId = params.id as string;
  const { token } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [linkStudentId, setLinkStudentId] = useState('');
  const [linkRelation, setLinkRelation] = useState('PARENT');
  const [form, setForm] = useState({
    nameAz: '', nameRu: '', nameEn: '',
    email: '', password: '', phone: '', isActive: true,
  });

  useEffect(() => {
    if (!token || !parentId) return;
    Promise.all([
      fetch(`${API_URL}/api/admin/parents/${parentId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch(`${API_URL}/api/admin/students?limit=200`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([pd, sd]) => {
      if (pd.success) {
        setParent(pd.data);
        setForm({
          nameAz: pd.data.nameAz || '',
          nameRu: pd.data.nameRu || '',
          nameEn: pd.data.nameEn || '',
          email: pd.data.email || '',
          password: '',
          phone: pd.data.phone || '',
          isActive: pd.data.isActive,
        });
      }
      if (sd.success) setStudents(sd.data || []);
    }).finally(() => setLoading(false));
  }, [token, parentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body: any = { ...form };
      if (!body.password) delete body.password;
      const res = await fetch(`${API_URL}/api/admin/parents/${parentId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) { setError(d.message || 'Error'); setSaving(false); return; }
      router.push('/admin/parents');
    } catch (e) { setError('Network error'); }
    setSaving(false);
  };

  const linkChild = async () => {
    if (!linkStudentId) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/parents/${parentId}/link-child`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: linkStudentId, relation: linkRelation }),
      });
      const d = await res.json();
      if (d.success) {
        setLinkStudentId('');
        // Refresh parent data
        const pd = await fetch(`${API_URL}/api/admin/parents/${parentId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
        if (pd.success) setParent(pd.data);
      } else {
        setError(d.message);
      }
    } catch (e) { setError('Network error'); }
  };

  const unlinkChild = async (studentId: string) => {
    if (!confirm('Unlink this child?')) return;
    try {
      await fetch(`${API_URL}/api/admin/parents/${parentId}/unlink-child/${studentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const pd = await fetch(`${API_URL}/api/admin/parents/${parentId}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
      if (pd.success) setParent(pd.data);
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="space-y-4"><div className="h-8 bg-surface-dark rounded w-1/3 animate-pulse" /><div className="h-64 bg-surface-dark rounded-xl animate-pulse" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => router.push('/admin/parents')} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Parents
      </button>
      <h1 className="text-2xl font-bold text-white">Edit Parent</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface-dark rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Personal Info</h2>
          {['Az', 'Ru', 'En'].map((lang) => (
            <div key={lang}>
              <label className="block text-sm text-gray-400 mb-1">Name ({lang})</label>
              <input
                value={(form as any)[`name${lang}`]}
                onChange={(e) => setForm({ ...form, [`name${lang}`]: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">New Password (leave empty to keep)</label>
            <input
              type="password" value={form.password}
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
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-gray-600"
            />
            <span className="text-sm text-gray-300">Active</span>
          </label>
        </div>

        {error && <div className="bg-red-900/20 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Update Parent'}
        </button>
      </form>

      {/* Linked children */}
      <div className="bg-surface-dark rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Linked Children</h2>
        {parent?.children?.length > 0 ? (
          <div className="space-y-2">
            {parent.children.map((link: any) => (
              <div key={link.id} className="flex items-center gap-3 bg-bg-dark rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                  {link.student?.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{link.student?.name}</p>
                  <p className="text-xs text-gray-400">{link.student?.email} &bull; {link.relation}</p>
                </div>
                <button onClick={() => unlinkChild(link.student.id)} className="p-1.5 rounded text-red-400 hover:bg-red-900/20 transition-colors" title="Unlink">
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No children linked</p>
        )}

        {/* Link new child */}
        <div className="flex gap-2 pt-2 border-t border-gray-700">
          <select
            value={linkStudentId}
            onChange={(e) => setLinkStudentId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm outline-none"
          >
            <option value="">Select student to link...</option>
            {students
              .filter((s) => !parent?.children?.some((c: any) => c.student?.id === s.id))
              .map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
          </select>
          <select
            value={linkRelation}
            onChange={(e) => setLinkRelation(e.target.value)}
            className="w-28 px-2 py-2 rounded-lg bg-bg-dark border border-gray-700 text-white text-sm"
          >
            <option value="PARENT">Parent</option>
            <option value="MOTHER">Mother</option>
            <option value="FATHER">Father</option>
            <option value="GUARDIAN">Guardian</option>
          </select>
          <button
            type="button"
            onClick={linkChild}
            disabled={!linkStudentId}
            className="flex items-center gap-1 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Link2 className="w-4 h-4" /> Link
          </button>
        </div>
      </div>
    </div>
  );
}
