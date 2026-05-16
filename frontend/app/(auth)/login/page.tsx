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
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string; password: string }>();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.access_token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.replace('/dashboard');
    },
    onError: () => toast.error('Invalid email or password'),
  });

  return (
    <div className="w-full max-w-md">
      <div className="bg-[#16213E] border border-[#0F3460]/60 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center mb-4"><Sparkles className="w-6 h-6 text-white" /></div>
          <h1 className="text-2xl font-bold text-white">Staff Sign In</h1>
          <p className="text-gray-400 text-sm mt-1">Metro Events ERM System</p>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <Input label="Email Address" type="email" placeholder="admin@metroevents.ph" {...register('email', { required: 'Required' })} error={errors.email?.message} />
          <Input label="Password" type="password" placeholder="••••••••" {...register('password', { required: 'Required' })} error={errors.password?.message} />
          <Button type="submit" loading={mutation.isPending} className="w-full justify-center py-2.5 mt-2">Sign In</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Client?{' '}<Link href="/client/login" className="text-brand-gold hover:underline">Login to your portal →</Link>
        </p>
      </div>
    </div>
  );
}
