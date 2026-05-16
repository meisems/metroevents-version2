'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Heart } from 'lucide-react';

export default function ClientLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit } = useForm<{ email: string; password: string }>();
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => { setAuth(res.data.user, res.data.access_token); router.replace('/portal'); },
    onError: () => toast.error('Invalid credentials'),
  });
  return (
    <div className="w-full max-w-md">
      <div className="bg-[#16213E] border border-[#0F3460]/60 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center mb-4"><Heart className="w-6 h-6 text-rose-400" /></div>
          <h1 className="text-2xl font-bold text-white">Client Portal</h1>
          <p className="text-gray-400 text-sm mt-1">View your event progress</p>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Email" type="email" placeholder="your@email.com" {...register('email')} />
          <Input label="Password" type="password" placeholder="••••••••" {...register('password')} />
          <Button type="submit" loading={mutation.isPending} className="w-full justify-center py-2.5">Sign In</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          New client?{' '}<Link href="/client/register" className="text-brand-gold hover:underline">Register here →</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Staff?{' '}<Link href="/login" className="text-brand-gold hover:underline">Staff login →</Link>
        </p>
      </div>
    </div>
  );
}
