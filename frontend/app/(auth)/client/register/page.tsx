'use client';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ClientRegisterPage() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<{ name: string; email: string; password: string; phone: string }>();
  const mutation = useMutation({
    mutationFn: (d: object) => authApi.register(d),
    onSuccess: () => { toast.success('Registration submitted! Check your email to verify your account.'); router.replace('/client/login'); },
    onError: () => toast.error('Registration failed. Email may already be in use.'),
  });
  return (
    <div className="w-full max-w-md">
      <div className="bg-[#16213E] border border-[#0F3460]/60 rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create Client Account</h1>
        <p className="text-gray-400 text-sm mb-6">Your account will be reviewed by our team before activation.</p>
        <form onSubmit={handleSubmit((d) => mutation.mutate({ ...d, role: 'client' }))} className="space-y-4">
          <Input label="Full Name" placeholder="Maria Santos" {...register('name')} />
          <Input label="Email" type="email" placeholder="maria@email.com" {...register('email')} />
          <Input label="Phone" placeholder="+63 917 000 0000" {...register('phone')} />
          <Input label="Password" type="password" placeholder="Min. 8 characters" {...register('password')} />
          <Button type="submit" loading={mutation.isPending} className="w-full justify-center py-2.5">Register</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4"><Link href="/client/login" className="text-brand-gold hover:underline">Already have an account?</Link></p>
      </div>
    </div>
  );
}
