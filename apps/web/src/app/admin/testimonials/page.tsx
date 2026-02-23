'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Plus,
  Pencil,
  Trash2,
  Star,
  User,
  ToggleLeft,
  ToggleRight,
  Search,
  Inbox,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  photo?: string;
  textAz: string;
  textRu?: string;
  textEn?: string;
  rating: number;
  courseAz?: string;
  courseRu?: string;
  courseEn?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminTestimonialsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, [token]);

  async function fetchTestimonials() {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: Testimonial[] }>(
        '/admin/testimonials',
        { token: token || undefined }
      );
      if (res.success) {
        setTestimonials(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(id: string, isActive: boolean) {
    try {
      await api.put(
        `/admin/testimonials/${id}`,
        { isActive: !isActive },
        { token: token || undefined }
      );
      setTestimonials((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: !isActive } : t))
      );
    } catch (err) {
      console.error('Failed to toggle active:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/testimonials/${id}`, { token: token || undefined });
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredTestimonials = testimonials.filter(
    (t) =>
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.courseAz?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'w-3.5 h-3.5',
              i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Testimonials</h1>
          <p className="text-gray-400 mt-1">Manage student testimonials and reviews.</p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-900 dark:text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          Add Testimonial
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or course..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#141927]/60 border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700/50 animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
                </div>
              </div>
              <div className="w-full h-16 bg-gray-200 dark:bg-gray-700/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl py-16 text-center">
          <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No testimonials found</p>
          <p className="text-gray-500 text-sm mt-1">
            {searchQuery ? 'Try a different search' : 'Add your first testimonial'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-[#141927]/60 backdrop-blur-sm border border-gray-200 dark:border-gray-800/50 rounded-2xl p-5 hover:border-gray-200 dark:border-gray-700/50 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center overflow-hidden shrink-0">
                    {testimonial.photo ? (
                      <img
                        src={testimonial.photo}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{testimonial.name}</h3>
                    {testimonial.courseAz && (
                      <p className="text-xs text-gray-500 mt-0.5">{testimonial.courseAz}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(testimonial.id, testimonial.isActive)}
                  className="shrink-0"
                  title={testimonial.isActive ? 'Deactivate' : 'Activate'}
                >
                  {testimonial.isActive ? (
                    <ToggleRight className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Rating */}
              <div className="mb-3">{renderStars(testimonial.rating)}</div>

              {/* Text */}
              <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                {testimonial.textAz}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800/30">
                <span
                  className={cn(
                    'text-[10px] font-medium px-2 py-0.5 rounded-full',
                    testimonial.isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-gray-500/10 text-gray-500'
                  )}
                >
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/testimonials/${testimonial.id}/edit`}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={deletingId === testimonial.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
