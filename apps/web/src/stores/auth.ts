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
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  adminLocale: string;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setAdminLocale: (locale: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      adminLocale: 'az',
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
      setLoading: (loading) => set({ isLoading: loading }),
      setAdminLocale: (locale) => set({ adminLocale: locale }),
    }),
    {
      name: 'futureup-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        adminLocale: state.adminLocale,
      }),
    }
  )
);
