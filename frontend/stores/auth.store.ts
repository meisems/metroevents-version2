import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        Cookies.set('token', token, { expires: 7 });
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        Cookies.remove('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'metro-auth', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
);
