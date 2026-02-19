'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { getLocalized } from '@/lib/admin-locale';
import { cn } from '@/lib/utils';
import {
  Newspaper,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Image as ImageIcon,
  Search,
  Inbox,
  RefreshCw,
} from 'lucide-react';

interface NewsArticle {
  id: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  contentAz?: string;
  contentRu?: string;
  contentEn?: string;
  image?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function AdminNewsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, [token]);

  async function fetchNews() {
    try {
      setLoading(true);
      const res = await api.get<{ success: boolean; data: NewsArticle[] }>(
        '/admin/news',
        { token: token || undefined }
      );
      if (res.success) {
        setArticles(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublished(id: string, isPublished: boolean) {
    try {
      await api.put(
        `/admin/news/${id}`,
        { isPublished: !isPublished },
        { token: token || undefined }
      );
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isPublished: !isPublished } : a))
      );
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/admin/news/${id}`, { token: token || undefined });
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete article:', err);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredArticles = articles.filter(
    (a) =>
      !searchQuery ||
      a.titleAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.titleRu.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">News Articles</h1>
          <p className="text-gray-400 mt-1">Manage news and blog content.</p>
        </div>
        <Link
          href="/admin/news/new"
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all duration-200',
            'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700',
            'shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30',
            'active:scale-[0.98]'
          )}
        >
          <Plus className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#141927]/60 border border-gray-800/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
        />
      </div>

      {/* Articles list */}
      <div className="bg-[#141927]/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-800/30">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-700/50 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 bg-gray-700/50 rounded animate-pulse" />
                  <div className="w-32 h-3 bg-gray-700/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No articles found</p>
            <p className="text-gray-500 text-sm mt-1">
              {searchQuery ? 'Try a different search' : 'Create your first article to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/30">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="px-6 py-5 flex items-center gap-4 hover:bg-gray-800/20 transition-colors group"
              >
                {/* Image thumbnail */}
                <div className="w-16 h-16 rounded-xl bg-gray-800/50 border border-gray-700/30 overflow-hidden shrink-0 flex items-center justify-center">
                  {article.image ? (
                    <img
                      src={article.image}
                      alt={article.titleAz}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white truncate">
                    {article.titleAz}
                  </h3>
                  {article.titleEn && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      EN: {article.titleEn}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium',
                        article.isPublished
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-gray-500/10 text-gray-400'
                      )}
                    >
                      {article.isPublished ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      {article.isPublished ? 'Published' : 'Draft'}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePublished(article.id, article.isPublished)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      article.isPublished
                        ? 'text-emerald-400 hover:bg-emerald-500/10'
                        : 'text-gray-400 hover:bg-gray-800/50'
                    )}
                    title={article.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {article.isPublished ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    href={`/admin/news/${article.id}/edit`}
                    className="p-2 rounded-lg text-gray-400 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(article.id)}
                    disabled={deletingId === article.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
