'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Plus, Search, Edit, Trash2, Baby, Mail, Phone } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function AdminParentsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});

  const fetchParents = async (p = 1, s = '') => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: '20' });
      if (s) params.append('search', s);
      const res = await fetch(`${API_URL}/api/admin/parents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) {
        setParents(d.data);
        setMeta(d.meta || {});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchParents(page, search); }, [token, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchParents(1, search);
  };

  const deleteParent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this parent?')) return;
    try {
      await fetch(`${API_URL}/api/admin/parents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchParents(page, search);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Parents</h1>
        <button
          onClick={() => router.push('/admin/parents/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Parent
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parents..."
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-dark border border-gray-700 text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
        />
      </form>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-20 bg-surface-dark rounded-xl animate-pulse" />)}</div>
      ) : parents.length === 0 ? (
        <div className="bg-surface-dark rounded-xl p-12 text-center">
          <Baby className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold">No parents found</h3>
        </div>
      ) : (
        <div className="space-y-2">
          {parents.map((parent) => (
            <div key={parent.id} className="bg-surface-dark rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {parent.nameEn?.charAt(0).toUpperCase() || 'P'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{parent.nameEn || parent.nameAz}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {parent.email}</span>
                  {parent.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {parent.phone}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-purple-900/30 text-purple-400 font-medium">
                  {parent._count?.children || 0} children
                </span>
                <span className={`px-2 py-1 rounded-full font-medium ${parent.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                  {parent.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => router.push(`/admin/parents/${parent.id}/edit`)} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteParent(parent.id)} className="p-2 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg bg-surface-dark text-white text-sm disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-400">Page {page} of {meta.totalPages}</span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg bg-surface-dark text-white text-sm disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
