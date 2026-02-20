'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { getAdminT } from '@/lib/admin-translations';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  Newspaper,
  MessageSquare,
  Award,
  FileText,
  Settings,
  Handshake,
  Star,
  X,
  Sparkles,
  UserCog,
  Wallet,
  Building2,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SidebarKey = 'dashboard' | 'courses' | 'teachers' | 'students' | 'applications' | 'certificates' | 'news' | 'testimonials' | 'reviews' | 'scholarships' | 'corporate' | 'partners' | 'settings';

const menuItems: { key: SidebarKey; href: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'courses', href: '/admin/courses', icon: BookOpen },
  { key: 'teachers', href: '/admin/teachers', icon: Users },
  { key: 'students', href: '/admin/students', icon: GraduationCap },
  { key: 'applications', href: '/admin/applications', icon: FileText },
  { key: 'certificates', href: '/admin/certificates', icon: Award },
  { key: 'news', href: '/admin/news', icon: Newspaper },
  { key: 'testimonials', href: '/admin/testimonials', icon: MessageSquare },
  { key: 'reviews', href: '/admin/reviews', icon: Star },
  { key: 'scholarships', href: '/admin/scholarships', icon: Wallet },
  { key: 'corporate', href: '/admin/corporate', icon: Building2 },
  { key: 'partners', href: '/admin/partners', icon: Handshake },
  { key: 'settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { adminLocale } = useAuthStore();
  const t = getAdminT('sidebar', adminLocale);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-50 h-full w-72 bg-[#111827]/95 backdrop-blur-xl border-r border-gray-800/50 transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800/50">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white">FutureUp</span>
            <span className="text-[10px] ml-1 px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded font-medium">ADMIN</span>
          </div>
        </Link>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-800/50 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem-4rem)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary-500/15 text-primary-400 shadow-sm'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              <Icon className={cn('w-[18px] h-[18px]', active && 'text-primary-400')} />
              {t[item.key]}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800/50">
        <Link
          href="/admin/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
        >
          <UserCog className="w-[18px] h-[18px]" />
          {t.adminSettings}
        </Link>
      </div>
    </aside>
  );
}
