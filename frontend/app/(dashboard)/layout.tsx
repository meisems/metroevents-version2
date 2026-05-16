'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    else if (user?.role === 'client') router.replace('/portal');
  }, [isAuthenticated, user, router]);
  if (!isAuthenticated) return null;
  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
