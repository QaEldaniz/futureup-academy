'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { Sparkles } from 'lucide-react';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token, setLoading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Wait for zustand persist rehydration
    const timer = setTimeout(() => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated || !state.token) {
        router.replace('/admin/login');
      } else {
        setLoading(false);
        setChecking(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, token, router, setLoading]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:0ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:150ms]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce [animation-delay:300ms]" />
          </div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
