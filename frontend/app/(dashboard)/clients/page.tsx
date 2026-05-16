'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { clientsApi } from '@/lib/api';
import { CRM_STAGES, fmt } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { Users, Plus, Search, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', search, stage],
    queryFn: () => clientsApi.list({ search: search || undefined, stage: stage || undefined }).then(r => r.data),
  });

  const advanceMutation = useMutation({
    mutationFn: (id: string) => clientsApi.advance(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); toast.success('Stage advanced!'); },
    onError: () => toast.error('Cannot advance stage'),
  });

  const stageCounts = Object.keys(CRM_STAGES).reduce((acc, k) => {
    acc[k] = (clients as any[]).filter((c: any) => c.stage === k).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Pipeline strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.entries(CRM_STAGES).map(([key, { label, color }]) => (
          <button key={key} onClick={() => setStage(stage === key ? '' : key)}
            className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition ${stage === key ? color : 'bg-[#16213E] border-[#0F3460]/50 text-gray-400 hover:text-white'}`}>
            {label} <span className="bg-black/20 rounded-full px-1.5 py-0.5 font-bold">{stageCounts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Header + Search */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            className="w-full pl-9 pr-4 py-2 bg-[#16213E] border border-[#0F3460]/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Client</Button>
      </div>

      {/* Table */}
      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-400 uppercase tracking-wide">
            {['Client','Contact','Stage','Last Contacted','Actions'].map(h => <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>)}
          </tr></thead>
          <tbody>
            {isLoading ? [...Array(5)].map((_,i) => (
              <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-5 bg-[#0D1117] rounded animate-pulse" /></td></tr>
            )) : (clients as any[]).map((c: any) => {
              const st = CRM_STAGES[c.stage] ?? { label: c.stage, color: '' };
              return (
                <tr key={c.id} className="border-b border-[#0F3460]/20 hover:bg-[#0D1117]/40 transition group">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${c.id}`} className="font-medium text-white hover:text-brand-gold transition">{c.name}</Link>
                    {c.instagram && <p className="text-xs text-gray-500">@{c.instagram}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{c.email}<br/><span className="text-xs">{c.phone}</span></td>
                  <td className="px-4 py-3"><Badge label={st.label} className={st.color} /></td>
                  <td className="px-4 py-3 text-sm text-gray-400">{fmt(c.lastContacted)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/clients/${c.id}`} className="text-xs text-brand-gold hover:underline">View</Link>
                      {!['done','cancelled'].includes(c.stage) && (
                        <button onClick={() => advanceMutation.mutate(c.id)} className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5">
                          Advance <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && clients.length === 0 && <EmptyState icon={Users} title="No clients found" sub="Add your first client to get started." />}
      </div>

      {showCreate && <CreateClientModal onClose={() => setShowCreate(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['clients'] }); setShowCreate(false); }} />}
    </div>
  );
}

function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues: { name:'', email:'', phone:'', instagram:'', address:'', referralSource:'', notes:'' } });
  const mutation = useMutation({ mutationFn: clientsApi.create, onSuccess: () => { toast.success('Client added!'); onCreated(); }, onError: () => toast.error('Failed to add client') });
  return (
    <Modal title="Add New Client" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Full Name *" placeholder="Maria Santos" {...register('name')} /></div>
          <Input label="Email" type="email" placeholder="maria@email.com" {...register('email')} />
          <Input label="Phone" placeholder="+63 917 000 0000" {...register('phone')} />
          <Input label="Instagram" placeholder="@mariasantos" {...register('instagram')} />
          <Input label="Referral Source" placeholder="Facebook, Referral…" {...register('referralSource')} />
          <div className="col-span-2"><Input label="Address" placeholder="Quezon City" {...register('address')} /></div>
          <div className="col-span-2"><Textarea label="Notes" rows={3} placeholder="Initial inquiry notes…" {...register('notes')} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Add Client</Button>
        </div>
      </form>
    </Modal>
  );
}
