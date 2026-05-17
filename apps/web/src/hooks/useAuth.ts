// apps/web/src/hooks/useAuth.ts
'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isRole: (...roles: string[]) => boolean;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      login: (user, token) => {
        localStorage.setItem('accessToken', token);
        // Set cookies for middleware
        document.cookie = `accessToken=${token}; path=/; max-age=${7 * 24 * 3600}`;
        document.cookie = `userRole=${user.role}; path=/; max-age=${7 * 24 * 3600}`;
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('accessToken');
        document.cookie = 'accessToken=; Max-Age=0; path=/';
        document.cookie = 'userRole=; Max-Age=0; path=/';
        set({ user: null, token: null });
        window.location.href = '/login';
      },
      isRole: (...roles) => {
        const role = get().user?.role ?? '';
        return roles.includes(role);
      },
    }),
    { name: 'metro-auth' },
  ),
);

export const useIsAdmin = () => useAuth((s) => s.user?.role === 'admin');
export const useIsStaff = () =>
  useAuth((s) =>
    ['admin', 'coordinator', 'designer', 'warehouse'].includes(s.user?.role ?? ''),
  );
export const useIsCoordinator = () =>
  useAuth((s) => ['admin', 'coordinator'].includes(s.user?.role ?? ''));
export const useIsClient = () => useAuth((s) => s.user?.role === 'client');
