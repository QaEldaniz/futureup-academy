'use client';

import {
  Menu, Bell, Search, LogOut, User, ChevronDown, Sun, Moon, Globe, FileText, Star, Loader2,
  LayoutDashboard, BookOpen, Users, GraduationCap, Newspaper, MessageSquare, Award, Settings,
  Handshake, Wallet, Building2, X,
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const searchableItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, keywords: 'home overview stats' },
  { label: 'Courses', href: '/admin/courses', icon: BookOpen, keywords: 'course class program' },
  { label: 'Add New Course', href: '/admin/courses/new', icon: BookOpen, keywords: 'create new course' },
  { label: 'Teachers', href: '/admin/teachers', icon: Users, keywords: 'teacher instructor mentor' },
  { label: 'Add New Teacher', href: '/admin/teachers/new', icon: Users, keywords: 'create new teacher' },
  { label: 'Students', href: '/admin/students', icon: GraduationCap, keywords: 'student pupil learner' },
  { label: 'Add New Student', href: '/admin/students/new', icon: GraduationCap, keywords: 'create new student' },
  { label: 'Applications', href: '/admin/applications', icon: FileText, keywords: 'application apply form request' },
  { label: 'Certificates', href: '/admin/certificates', icon: Award, keywords: 'certificate diploma award' },
  { label: 'Create Certificate', href: '/admin/certificates/new', icon: Award, keywords: 'create new certificate' },
  { label: 'News', href: '/admin/news', icon: Newspaper, keywords: 'news article blog post' },
  { label: 'Add News Article', href: '/admin/news/new', icon: Newspaper, keywords: 'create new news article' },
  { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare, keywords: 'testimonial feedback' },
  { label: 'Reviews', href: '/admin/reviews', icon: Star, keywords: 'review rating' },
  { label: 'Scholarships', href: '/admin/scholarships', icon: Wallet, keywords: 'scholarship grant' },
  { label: 'Corporate', href: '/admin/corporate', icon: Building2, keywords: 'corporate b2b business' },
  { label: 'Partners', href: '/admin/partners', icon: Handshake, keywords: 'partner company logo' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, keywords: 'settings configuration profile' },
];

interface RecentApplication {
  id: string;
  fullName: string;
  status: string;
  createdAt: string;
  course: { titleAz: string; titleRu: string; titleEn: string } | null;
}

interface RecentReview {
  id: string;
  rating: number;
  comment: string;
  status: string;
  student: { name: string };
  course: { titleAz: string };
  teacher: { nameAz: string };
}

interface NotificationData {
  pendingApplications: number;
  pendingReviews: number;
  recentApplications: RecentApplication[];
  recentReviews: RecentReview[];
}

interface AdminHeaderProps {
  onMenuClick: () => void;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, token, logout, adminLocale, setAdminLocale } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifData, setNotifData] = useState<NotificationData | null>(null);
  const [notifLoading, setNotifLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'az', label: 'AZ', flag: '🇦🇿' },
    { code: 'ru', label: 'RU', flag: '🇷🇺' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
  ];

  // Language preference stored in Zustand (admin routes don't use URL locale)
  const currentLocale = adminLocale || 'az';

  const switchLanguage = (locale: string) => {
    setAdminLocale(locale);
    setLangOpen(false);
  };

  // Fetch notification data from dashboard API
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setNotifLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: { stats: NotificationData; recentApplications: RecentApplication[]; recentReviews: RecentReview[] } }>('/dashboard', { token });
      const data = res.data;
      setNotifData({
        pendingApplications: data.stats?.pendingApplications || 0,
        pendingReviews: data.stats?.pendingReviews || 0,
        recentApplications: data.recentApplications || [],
        recentReviews: data.recentReviews || [],
      });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, [token]);

  // Fetch on mount and periodically
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // every 60s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const totalPending = (notifData?.pendingApplications || 0) + (notifData?.pendingReviews || 0);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search filtering
  const filteredSearch = searchQuery.trim() === ''
    ? searchableItems
    : searchableItems.filter((item) => {
        const q = searchQuery.toLowerCase();
        return item.label.toLowerCase().includes(q) || item.keywords.toLowerCase().includes(q);
      });

  // ⌘K / Ctrl+K shortcut to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setSearchQuery('');
        setSearchIndex(0);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Reset search index when query changes
  useEffect(() => {
    setSearchIndex(0);
  }, [searchQuery]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex((prev) => Math.min(prev + 1, filteredSearch.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredSearch[searchIndex]) {
      e.preventDefault();
      router.push(filteredSearch[searchIndex].href);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#111827]/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search trigger */}
          <button
            onClick={() => { setSearchOpen(true); setSearchQuery(''); setSearchIndex(0); }}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/30 border border-gray-700/30 w-64 lg:w-80 hover:bg-gray-800/50 transition-colors"
          >
            <Search className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500 flex-1 text-left">Search...</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded bg-gray-700/50 text-[10px] text-gray-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium uppercase">{currentLocale}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-[#1a2035] border border-gray-700/50 shadow-2xl shadow-black/30 overflow-hidden z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors',
                      currentLocale === lang.code
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    )}
                  >
                    <span className="text-base">{lang.flag}</span>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                if (!notifOpen) fetchNotifications();
              }}
              className="relative p-2 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {totalPending > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-primary-500 ring-2 ring-[#111827] text-[10px] font-bold text-white">
                  {totalPending > 99 ? '99+' : totalPending}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-[#1a2035] border border-gray-700/50 shadow-2xl shadow-black/30 overflow-hidden z-50">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {totalPending > 0 && (
                    <span className="text-xs font-medium text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                      {totalPending} pending
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="max-h-80 overflow-y-auto">
                  {notifLoading && !notifData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    </div>
                  ) : (
                    <>
                      {/* Pending Applications */}
                      {(notifData?.pendingApplications || 0) > 0 && (
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            router.push('/admin/applications');
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/30"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4 text-amber-400" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {notifData!.pendingApplications} new application{notifData!.pendingApplications > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Waiting for review</p>
                          </div>
                          <span className="text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded-full shrink-0">
                            NEW
                          </span>
                        </button>
                      )}

                      {/* Pending Reviews */}
                      {(notifData?.pendingReviews || 0) > 0 && (
                        <button
                          onClick={() => {
                            setNotifOpen(false);
                            router.push('/admin/reviews');
                          }}
                          className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/30"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Star className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                              {notifData!.pendingReviews} pending review{notifData!.pendingReviews > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Awaiting moderation</p>
                          </div>
                          <span className="text-xs text-purple-400 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full shrink-0">
                            PENDING
                          </span>
                        </button>
                      )}

                      {/* Recent Applications List */}
                      {notifData?.recentApplications && notifData.recentApplications.length > 0 && (
                        <>
                          <div className="px-4 py-2 bg-gray-800/20">
                            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Recent Applications</p>
                          </div>
                          {notifData.recentApplications.slice(0, 3).map((app) => (
                            <button
                              key={app.id}
                              onClick={() => {
                                setNotifOpen(false);
                                router.push('/admin/applications');
                              }}
                              className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {app.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-200 truncate">{app.fullName}</p>
                                <p className="text-[11px] text-gray-500 truncate">{app.course?.titleAz || 'Course'}</p>
                              </div>
                              <span className="text-[10px] text-gray-500 shrink-0">{timeAgo(app.createdAt)}</span>
                            </button>
                          ))}
                        </>
                      )}

                      {/* Empty state */}
                      {totalPending === 0 && (!notifData?.recentApplications || notifData.recentApplications.length === 0) && (
                        <div className="flex flex-col items-center py-8 text-center">
                          <Bell className="w-8 h-8 text-gray-600 mb-2" />
                          <p className="text-sm text-gray-400">No notifications</p>
                          <p className="text-xs text-gray-500 mt-0.5">You&#39;re all caught up!</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-700/50">
                  <button
                    onClick={() => {
                      setNotifOpen(false);
                      router.push('/admin');
                    }}
                    className="w-full px-4 py-2.5 text-xs font-medium text-primary-400 hover:bg-gray-800/50 transition-colors text-center"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-200 leading-tight">
                  {user?.name || 'Admin'}
                </p>
                <p className="text-[11px] text-gray-500 leading-tight">
                  {user?.role || 'Administrator'}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  'w-3.5 h-3.5 text-gray-500 transition-transform duration-200',
                  dropdownOpen && 'rotate-180'
                )}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#1a2035] border border-gray-700/50 shadow-2xl shadow-black/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/admin/settings');
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Command Palette Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-[#1a2035] border border-gray-700/50 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700/50">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search pages..."
                className="bg-transparent text-sm text-white placeholder-gray-500 outline-none w-full"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-gray-700/50 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2">
              {filteredSearch.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No results found</p>
                </div>
              ) : (
                filteredSearch.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        router.push(item.href);
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className={cn(
                        'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors',
                        i === searchIndex
                          ? 'bg-primary-500/15 text-primary-400'
                          : 'text-gray-300 hover:bg-gray-800/50'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {i === searchIndex && (
                        <kbd className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded bg-gray-700/50 font-mono">↵</kbd>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-700/50 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-700/50 font-mono">↑↓</kbd> Navigate</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-700/50 font-mono">↵</kbd> Open</span>
              <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-gray-700/50 font-mono">Esc</kbd> Close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
