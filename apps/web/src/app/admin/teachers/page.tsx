'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Mail,
  BookOpen,
  AlertTriangle,
  X,
  Linkedin,
  Github,
  UserX,
} from 'lucide-react';

interface Teacher {
  id: string;
  nameAz: string;
  nameRu?: string;
  nameEn?: string;
  bioAz?: string;
  photo?: string;
  specialization?: string;
  email?: string;
  linkedin?: string;
  github?: string;
  isActive: boolean;
  coursesCount?: number;
  _count?: {
    courses?: number;
  };
  createdAt: string;
}

interface TeachersResponse {
  success: boolean;
  data: Teacher[] | { teachers: Teacher[]; total: number; page: number; limit: number };
}

export default function AdminTeachersPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: '1', limit: '50' });
      if (search) params.set('search', search);

      const res = await api.get<TeachersResponse>(
        `/admin/teachers?${params.toString()}`,
        { token: token || undefined }
      );

      if (res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          setTeachers(data);
        } else if (data && 'teachers' in data) {
          setTeachers(data.teachers);
        }
      }
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchTeachers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchTeachers]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/teachers/${deleteId}`, {
        token: token || undefined,
      });
      setTeachers((prev) => prev.filter((t) => t.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete teacher:', err);
    } finally {
      setDeleting(false);
    }
  };

  const getCoursesCount = (teacher: Teacher) => {
    return teacher.coursesCount ?? teacher._count?.courses ?? 0;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-secondary-500/10">
              <Users className="w-6 h-6 text-secondary-400" />
            </div>
            Teachers
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your academy&apos;s teaching staff
          </p>
        </div>
        <Link
          href="/admin/teachers/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-semibold hover:from-primary-400 hover:to-secondary-500 transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30"
        >
          <Plus className="w-4 h-4" />
          Add Teacher
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search teachers by name, email, specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Teachers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-700/50" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-gray-700/50 rounded" />
                  <div className="w-24 h-3 bg-gray-700/50 rounded" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="w-full h-3 bg-gray-700/50 rounded" />
                <div className="w-2/3 h-3 bg-gray-700/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : teachers.length === 0 ? (
        /* Empty State */
        <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-16 text-center">
          <div className="inline-flex p-4 rounded-2xl bg-gray-800/50 mb-4">
            <UserX className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No teachers found
          </h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
            {search
              ? `No teachers match "${search}". Try adjusting your search.`
              : 'Get started by adding your first teacher to the academy.'}
          </p>
          {!search && (
            <Link
              href="/admin/teachers/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-600 text-white text-sm font-semibold hover:from-primary-400 hover:to-secondary-500 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add First Teacher
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="group relative bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-200 hover:shadow-lg hover:shadow-black/10"
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4">
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium',
                    teacher.isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  )}
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      teacher.isActive ? 'bg-emerald-400' : 'bg-red-400'
                    )}
                  />
                  {teacher.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Avatar + Info */}
              <div className="flex items-start gap-4 mb-4">
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={teacher.nameAz}
                    className="w-14 h-14 rounded-2xl object-cover border border-gray-700/50"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-600/20 flex items-center justify-center text-primary-400 font-bold text-lg border border-gray-700/50">
                    {teacher.nameAz?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                )}
                <div className="flex-1 min-w-0 pr-16">
                  <h3 className="text-base font-semibold text-white truncate">
                    {teacher.nameAz}
                  </h3>
                  {teacher.specialization && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">
                      {teacher.specialization}
                    </p>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-5">
                {teacher.email && (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <BookOpen className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>
                    {getCoursesCount(teacher)} course
                    {getCoursesCount(teacher) !== 1 ? 's' : ''} assigned
                  </span>
                </div>
                {(teacher.linkedin || teacher.github) && (
                  <div className="flex items-center gap-3 pt-1">
                    {teacher.linkedin && (
                      <a
                        href={teacher.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {teacher.github && (
                      <a
                        href={teacher.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-800/50">
                <Link
                  href={`/admin/teachers/${teacher.id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 text-gray-300 text-xs font-medium hover:bg-gray-700/50 hover:text-white transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteId(teacher.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 text-red-400/80 text-xs font-medium hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>

              {/* Gradient accent on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteId(null)}
          />
          <div className="relative bg-[#1a2035] border border-gray-800/50 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Delete Teacher
                </h3>
                <p className="text-sm text-gray-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to delete this teacher? All associated data
              including course assignments will be removed.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800/50 text-gray-300 text-sm font-medium hover:bg-gray-700/50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
