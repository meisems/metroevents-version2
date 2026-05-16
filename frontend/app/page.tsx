'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export default function Root() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (isAuthenticated) router.replace(user?.role === 'client' ? '/portal' : '/dashboard');
    else router.replace('/home');
  }, [isAuthenticated, user, router]);
  return null;
}
