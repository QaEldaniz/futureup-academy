'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Handshake,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  GripVertical,
  X,
  Save,
  Loader2,
  Image as ImageIcon,
  Inbox,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  order: number;
}

interface PartnerForm {
  name: string;
  logo: string;
  website: string;
  order: number;
}

const emptyForm: PartnerForm = {
  name: '',
  logo: '',
  website: '',
  order: 0,
};

export default function AdminPartnersPage() {
  const { token } = useAuthStore();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    mode: 'add' | 'edit';
    id?: string;
    form: PartnerForm;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPartners();
  }, [token]);

  async function fetchPartners() {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: Partner[] }>(
        '/admin/partners',
        { token: token || undefined }
      );
      if (res.success) {
        setPartners(res.data.sort((a, b) => a.order - b.order));
      }
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    const maxOrder = partners.length > 0 ? Math.max(...partners.map((p) => p.order)) + 1 : 1;
    setModal({ mode: 'add', form: { ...emptyForm, order: maxOrder } });
    setError('');
  }

  function openEditModal(partner: Partner) {
    setModal({
      mode: 'edit',
      id: partner.id,
      form: {
        name: partner.name,
        logo: partner.logo || '',
        website: partner.website || '',
        order: partner.order,
      },
    });
    setError('');
  }

  async function handleSave() {
    if (!modal) return;
    if (!modal.form.name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setSaving(true);
      setError('');
      if (modal.mode === 'add') {
        const res = await api.post<{ success: boolean; data: Partner }>(
          '/admin/partners',
          modal.form,
          { token: token || undefined }
        );
        if (res.success) {
          setPartners((prev) => [...prev, res.data].sort((a, b) => a.order - b.order));
          setModal(null);
        }
      } else {
        const res = await api.put<{ success: boolean; data: Partner }>(
          `/admin/partners/${modal.id}`,
          modal.form,
          { token: token || undefined }
        );
        if (res.success) {
          setPartners((prev) =>
            prev
              .map((p) => (p.id === modal.id ? { ...p, ...modal.form } : p))
              .sort((a, b) => a.order - b.order)
          );
          setModal(null);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save partner';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this partner?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/partners/${id}`, { token: token || undefined });
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete partner:', err);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleReorder(id: string, direction: 'up' | 'down') {
    const idx = partners.findIndex((p) => p.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === partners.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const newPartners = [...partners];
    const tempOrder = newPartners[idx].order;
    newPartners[idx].order = newPartners[swapIdx].order;
    newPartners[swapIdx].order = tempOrder;

    // Swap positions
    [newPartners[idx], newPartners[swapIdx]] = [newPartners[swapIdx], newPartners[idx]];
    setPartners(newPartners);

    // Persist both order changes
    try {
      await Promise.all([
        api.put(
          `/admin/partners/${newPartners[idx].id}`,
          { order: newPartners[idx].order },
          { token: token || undefined }
        ),
        api.put(
          `/admin/partners/${newPartners[swapIdx].id}`,
          { order: newPartners[swapIdx].order },
          { token: token || undefined }
        ),
      ]);
    } catch (err) {
      console.error('Failed to update order:', err);
      fetchPartners(); // Revert on error
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Partners</h1>
          <p className="text-gray-400 mt-1">Manage partner logos and ordering.</p>
        </div>
        <button
          onClick={openAddModal}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </button>
      </div>

      {/* Partners grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141927]/60 border border-gray-800/50 rounded-2xl p-5 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl py-16 text-center">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No partners yet</p>
          <p className="text-gray-500 text-sm mt-1">Add your first partner to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner, idx) => (
            <div
              key={partner.id}
              className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-5 hover:border-gray-700/50 transition-all group"
            >
              {/* Logo */}
              <div className="w-full h-20 rounded-xl bg-gray-800/30 border border-gray-700/20 flex items-center justify-center mb-4 overflow-hidden">
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain p-3"
                  />
                ) : (
                  <Handshake className="w-8 h-8 text-gray-600" />
                )}
              </div>

              {/* Info */}
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">{partner.name}</h3>
                  {partner.website && (
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-1 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate">{partner.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>
                <span className="text-[10px] text-gray-500 bg-gray-800/50 px-2 py-0.5 rounded-full shrink-0">
                  #{partner.order}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/30">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReorder(partner.id, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReorder(partner.id, 'down')}
                    disabled={idx === partners.length - 1}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(partner)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    disabled={deletingId === partner.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141927] border border-gray-800/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary-400" />
                {modal.mode === 'add' ? 'Add Partner' : 'Edit Partner'}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={modal.form.name}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, name: e.target.value } })
                  }
                  placeholder="Partner name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Logo URL
                  </span>
                </label>
                <input
                  type="text"
                  value={modal.form.logo}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, logo: e.target.value } })
                  }
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
                {modal.form.logo && (
                  <div className="mt-3 h-16 rounded-xl bg-gray-800/30 border border-gray-700/20 flex items-center justify-center overflow-hidden">
                    <img
                      src={modal.form.logo}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Website URL
                  </span>
                </label>
                <input
                  type="text"
                  value={modal.form.website}
                  onChange={(e) =>
                    setModal({ ...modal, form: { ...modal.form, website: e.target.value } })
                  }
                  placeholder="https://partner-website.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  value={modal.form.order}
                  onChange={(e) =>
                    setModal({
                      ...modal,
                      form: { ...modal.form, order: parseInt(e.target.value) || 0 },
                    })
                  }
                  min={0}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-800/50">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-xl border border-gray-700/50 text-gray-300 hover:text-white text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={cn(
                  'flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-white text-sm transition-all duration-200',
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
    </div>
  );
}
