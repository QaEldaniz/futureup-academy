'use client';

import { usePathname } from 'next/navigation';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Login page gets its own full-screen layout (no sidebar)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // All other admin pages use the panel layout with sidebar
  return <AdminPanelLayout>{children}</AdminPanelLayout>;
}

// Lazy import to avoid loading sidebar on login page
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { useState } from 'react';

function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-[#0b0f1a] text-gray-100">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="lg:pl-72">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
