// apps/web/src/app/(dashboard)/admin/users/page.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { useIsAdmin } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const ROLES = ['admin', 'coordinator', 'designer', 'warehouse', 'client'];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  coordinator: 'bg-purple-100 text-purple-700',
  designer: 'bg-pink-100 text-pink-700',
  warehouse: 'bg-blue-100 text-blue-700',
  client: 'bg-gray-100 text-gray-600',
};

export default function AdminUsersPage() {
  const isAdmin = useIsAdmin();
  const router = useRouter();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'coordinator', phone: '' });
  const [error, setError] = useState('');

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
    enabled: isAdmin,
  });

  const createUser = useMutation({
    mutationFn: (data: any) => api.post('/auth/register', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'coordinator', phone: '' });
      setError('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create user'),
  });

  const setRole = useMutation({
    mutationFn: ({ id, role }: any) => api.patch(`/users/${id}/role`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const toggleActive = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/toggle-active`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  if (!isAdmin) {
    return <div className="text-center py-16 text-gray-400">Access denied. Admins only.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
          + Create User
        </button>
      </div>

      {showCreate && (
        <div className="card p-6 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium">Create Staff Account</h3>
          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name *</label>
              <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" placeholder="Min 8 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.filter((r) => r !== 'client').map((r) => (
                  <option key={r} value={r} className="capitalize">{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+63 9XX XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => createUser.mutate(form)}
              disabled={!form.name || !form.email || !form.password || createUser.isPending}
            >
              {createUser.isPending ? 'Creating…' : 'Create User'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowCreate(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Last Login</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users?.map((u: any) => (
              <tr key={u.id} className={`hover:bg-gray-50 ${!u.isActive ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="text-xs border border-gray-200 rounded px-2 py-1"
                    value={u.role}
                    onChange={(e) => setRole.mutate({ id: u.id, role: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="capitalize">{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {u.lastLogin ? formatDate(u.lastLogin) : 'Never'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActive.mutate(u.id)}
                    className={`text-xs hover:underline ${u.isActive ? 'text-red-400' : 'text-green-600'}`}
                  >
                    {u.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
