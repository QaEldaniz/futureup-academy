'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, UserType } from '@/stores/auth';
import {
  LayoutDashboard, BookOpen, Award, Bell, User, LogOut, Menu, X,
  Users, MessageSquare, Calendar, ChevronRight, GraduationCap, Baby,
  ClipboardCheck, Star, CalendarDays, FileText, FileQuestion, Trophy, Bot,
} from 'lucide-react';
import NotificationBell from '@/components/lms/NotificationBell';
import { LmsLanguageSwitcher } from '@/components/lms/LmsLanguageSwitcher';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navByRole: Record<UserType, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/lms/student', icon: LayoutDashboard },
    { label: 'My Courses', href: '/lms/student/courses', icon: BookOpen },
    { label: 'Assignments', href: '/lms/student/assignments', icon: FileText },
    { label: 'Quizzes', href: '/lms/student/quizzes', icon: FileQuestion },
    { label: 'Messages', href: '/lms/student/messages', icon: MessageSquare },
    { label: 'Calendar', href: '/lms/student/calendar', icon: Calendar },
    { label: 'Achievements', href: '/lms/student/achievements', icon: Trophy },
    { label: 'Schedule', href: '/lms/student/schedule', icon: CalendarDays },
    { label: 'Attendance', href: '/lms/student/attendance', icon: ClipboardCheck },
    { label: 'Grades', href: '/lms/student/grades', icon: Star },
    { label: 'Certificates', href: '/lms/student/certificates', icon: Award },
    { label: 'Profile', href: '/lms/student/profile', icon: User },
  ],
  teacher: [
    { label: 'Dashboard', href: '/lms/teacher', icon: LayoutDashboard },
    { label: 'My Courses', href: '/lms/teacher/courses', icon: BookOpen },
    { label: 'Messages', href: '/lms/teacher/messages', icon: MessageSquare },
    { label: 'Calendar', href: '/lms/teacher/calendar', icon: Calendar },
    { label: 'Schedule', href: '/lms/teacher/schedule', icon: CalendarDays },
    { label: 'Students', href: '/lms/teacher/students', icon: Users },
    { label: 'Attendance', href: '/lms/teacher/attendance', icon: ClipboardCheck },
    { label: 'Grades', href: '/lms/teacher/grades', icon: Star },
  ],
  parent: [
    { label: 'Dashboard', href: '/lms/parent', icon: LayoutDashboard },
    { label: 'Children', href: '/lms/parent/children', icon: Baby },
    { label: 'Profile', href: '/lms/parent/profile', icon: User },
  ],
  admin: [
    { label: 'Dashboard', href: '/lms/teacher', icon: LayoutDashboard },
    { label: 'All Courses', href: '/lms/teacher/courses', icon: BookOpen },
    { label: 'Messages', href: '/lms/teacher/messages', icon: MessageSquare },
    { label: 'Calendar', href: '/lms/teacher/calendar', icon: Calendar },
    { label: 'Schedule', href: '/lms/teacher/schedule', icon: CalendarDays },
    { label: 'All Students', href: '/lms/teacher/students', icon: Users },
    { label: 'Attendance', href: '/lms/teacher/attendance', icon: ClipboardCheck },
    { label: 'Grades', href: '/lms/teacher/grades', icon: Star },
    { label: 'Admin Panel', href: '/admin', icon: LayoutDashboard },
  ],
};

function getUserDisplayName(user: any): string {
  return user?.name || user?.nameEn || user?.nameAz || user?.nameRu || 'User';
}

export default function LMSLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, token, logout, isLoading } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  // Verify token is still valid on mount
  useEffect(() => {
    if (!mounted || !token) return;
    fetch(`${API_URL}/api/health`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          logout();
          router.push('/login');
        }
      })
      .catch(() => {});
  }, [mounted, token, logout, router]);

  // Role guard: redirect if user tries to access wrong role's pages
  useEffect(() => {
    if (!mounted || !user) return;
    const isTeacherPath = pathname.startsWith('/lms/teacher');
    const isStudentPath = pathname.startsWith('/lms/student');
    const isParentPath = pathname.startsWith('/lms/parent');
    // Teachers and admins can access teacher pages
    if (isTeacherPath && user.type !== 'teacher' && user.type !== 'admin') {
      router.push(`/lms/${user.type}`);
    }
    // Only students can access student pages
    if (isStudentPath && user.type !== 'student') {
      router.push(`/lms/${user.type === 'admin' ? 'teacher' : user.type}`);
    }
    // Only parents can access parent pages
    if (isParentPath && user.type !== 'parent') {
      router.push(`/lms/${user.type === 'admin' ? 'teacher' : user.type}`);
    }
  }, [mounted, user, pathname, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const navItems = navByRole[user.type] || [];
  const displayName = getUserDisplayName(user);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="dark">
    <div className="min-h-screen bg-gray-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">FutureUp LMS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            user.type === 'student'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : user.type === 'teacher'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : user.type === 'admin'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
          }`}>
            {user.type === 'student' ? <BookOpen className="w-3 h-3" /> :
             user.type === 'teacher' ? <Users className="w-3 h-3" /> :
             user.type === 'admin' ? <GraduationCap className="w-3 h-3" /> :
             <Baby className="w-3 h-3" />}
            {user.type === 'admin' ? 'Admin (Super)' : user.type.charAt(0).toUpperCase() + user.type.slice(1)}
          </span>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const basePath = user.type === 'admin' ? '/lms/teacher' : `/lms/${user.type}`;
            const isActive = pathname === item.href || (item.href !== basePath && item.href !== '/admin' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => { e.preventDefault(); router.push(item.href); setSidebarOpen(false); }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </a>
            );
          })}
        </nav>

        {/* Bottom user section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white font-bold text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 sm:gap-3">
            <LmsLanguageSwitcher />
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Hello,</span>
              <span className="font-semibold text-gray-900 dark:text-white">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Global Ask AI button for students */}
      {user?.type === 'student' && <GlobalAskAIButton pathname={pathname} />}
    </div>
    </div>
  );
}

// ================================================================
// Global Draggable Ask AI Button (visible on all student pages)
// ================================================================
function GlobalAskAIButton({ pathname }: { pathname: string }) {
  const router = useRouter();
  const btnRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const [renderPos, setRenderPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragging = useRef(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const isHidden = pathname.includes('/ai-tutor');

  useEffect(() => {
    const x = window.innerWidth - 160;
    const y = window.innerHeight - 80;
    posRef.current = { x, y };
    setRenderPos({ x, y });
    setInitialized(true);
  }, []);

  const handleClick = useCallback(() => {
    const p = pathnameRef.current;
    const courseMatch = p.match(/\/lms\/student\/courses\/([^/]+)/);
    const courseId = courseMatch?.[1];

    if (courseId) {
      const lessonMatch = p.match(/\/lessons\/([^/]+)/);
      const lessonId = lessonMatch?.[1];
      const url = lessonId
        ? `/lms/student/courses/${courseId}/ai-tutor?lessonId=${lessonId}`
        : `/lms/student/courses/${courseId}/ai-tutor`;
      router.push(url);
    } else {
      router.push('/lms/student/courses');
    }
  }, [router]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    hasMoved.current = false;
    dragStartOffset.current = {
      x: e.clientX - posRef.current.x,
      y: e.clientY - posRef.current.y,
    };
    btnRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    hasMoved.current = true;
    const newX = Math.max(0, Math.min(window.innerWidth - 150, e.clientX - dragStartOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragStartOffset.current.y));
    posRef.current = { x: newX, y: newY };
    setRenderPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragging.current = false;
    btnRef.current?.releasePointerCapture(e.pointerId);
    if (!hasMoved.current) {
      handleClick();
    }
  }, [handleClick]);

  if (!initialized || isHidden) return null;

  return (
    <div
      ref={btnRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ left: renderPos.x, top: renderPos.y, touchAction: 'none' }}
      className="fixed z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 cursor-grab active:cursor-grabbing select-none transition-shadow"
    >
      <Bot className="w-5 h-5" />
      Ask AI
    </div>
  );
}
