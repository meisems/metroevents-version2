'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { fmt } from '@/lib/utils';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-300 border-red-500/30',
  coordinator: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  designer: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  warehouse: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  client: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list().then(r => r.data) });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => usersApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User updated'); },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User removed'); },
    onError: () => toast.error('Cannot delete user'),
  });

  const activeCount = (users as any[]).filter((u: any) => u.isActive).length;
  const adminCount = (users as any[]).filter((u: any) => u.role === 'admin').length;
  const clientCount = (users as any[]).filter((u: any) => u.role === 'client').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={(users as any[]).length} icon={Users} color="blue" />
        <StatCard title="Active" value={activeCount} icon={UserCheck} color="green" />
        <StatCard title="Admins" value={adminCount} icon={ShieldCheck} color="red" />
        <StatCard title="Clients" value={clientCount} icon={UserX} color="purple" />
      </div>

      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-500 uppercase">
            {['User','Email','Role','Last Login','Active','Actions'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {(users as any[]).map((u: any) => (
              <tr key={u.id} className="border-b border-[#0F3460]/20 hover:bg-[#0D1117]/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold text-xs font-bold shrink-0">{u.name?.[0]}</div>
                    <span className="font-medium text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400">{u.email}</td>
                <td className="px-4 py-3">
                  <Select value={u.role} onChange={e => updateMutation.mutate({ id: u.id, data: { role: e.target.value } })} className="py-1 text-xs w-auto">
                    {['admin','coordinator','designer','warehouse','client'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </Select>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{fmt(u.lastLogin)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => updateMutation.mutate({ id: u.id, data: { isActive: !u.isActive } })}
                    className={`w-9 h-5 rounded-full transition-colors ${u.isActive ? 'bg-brand-gold' : 'bg-gray-700'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full mx-0.5 transition-transform ${u.isActive ? 'translate-x-4' : ''}`} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <Button variant="danger" onClick={() => deleteMutation.mutate(u.id)} className="text-xs py-1 px-2">Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <EmptyState icon={Users} title="No users found" />}
      </div>
    </div>
  );
}
