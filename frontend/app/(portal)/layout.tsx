'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { Sparkles, LogOut, Heart } from 'lucide-react';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace('/client/login');
  }, [isAuthenticated, router]);
  if (!isAuthenticated) return null;
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-[5%] h-14 bg-[#0D1117]/90 backdrop-blur border-b border-[#0F3460]/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-white text-sm">Metro Events</span>
          <span className="text-xs text-gray-500 ml-1">Client Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={logout} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition"><LogOut className="w-4 h-4" /></button>
        </div>
      </nav>
      <main className="pt-14 px-[5%] py-8 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
