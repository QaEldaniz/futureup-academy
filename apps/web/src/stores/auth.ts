import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserType = 'admin' | 'teacher' | 'student' | 'parent';

interface User {
  id: string;
  email: string;
  name?: string;
  nameAz?: string;
  nameRu?: string;
  nameEn?: string;
  role: string;
  avatar?: string | null;
  photo?: string | null;
  type: UserType;
}

interface AuthState {
  token: null; // Always null — token lives in httpOnly cookie now. Kept for backward compat.
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminLocale: string;
  login: (userOrToken: User | string, user?: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setAdminLocale: (locale: string) => void;
}

const API_URL = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  if (typeof window !== 'undefined' && raw.includes('localhost')) return '';
  return raw;
})();

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      adminLocale: 'az',
      // Accepts both login(user) and legacy login(token, user)
      login: (userOrToken: User | string, user?: User) => {
        const actualUser = typeof userOrToken === 'string' ? user! : userOrToken;
        set({
          user: actualUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      logout: () => {
        fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setAdminLocale: (locale) => set({ adminLocale: locale }),
    }),
    {
      name: 'futureup-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        adminLocale: state.adminLocale,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false;
        }
      },
    }
  )
);
