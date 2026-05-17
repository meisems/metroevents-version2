// apps/web/src/app/portal/register/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function PortalRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, role: 'client' });
      login(data.user, data.accessToken);
      router.push('/portal');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌸</div>
          <h1 className="text-xl font-bold">Create Client Account</h1>
          <p className="text-gray-500 text-sm mt-1">Start planning your dream event</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          <div>
            <label className="label">Full Name *</label>
            <input className="input" required value={form.name} onChange={f('name')} placeholder="Maria Santos" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" required value={form.email} onChange={f('email')} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={f('phone')} placeholder="+63 9XX XXX XXXX" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input type="password" className="input" required value={form.password} onChange={f('password')} placeholder="Min 8 characters" />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
          <p className="text-center text-xs text-gray-400">
            By registering, you agree to our terms. Your account will be reviewed by our team.
          </p>
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/portal/login" className="text-amber-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
