// apps/web/src/app/(dashboard)/clients/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', instagram: '',
    address: '', referredBy: '', notes: '', pipelineStage: 'new_inquiry',
  });
  const [error, setError] = useState('');

  const create = useMutation({
    mutationFn: (data: any) => api.post('/clients', data),
    onSuccess: (res) => router.push(`/clients/${res.data.id}`),
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create client'),
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600 text-sm">← Clients</Link>
        <h1 className="text-2xl font-bold">New Client</h1>
      </div>

      <form
        className="card p-7 space-y-5"
        onSubmit={(e) => { e.preventDefault(); create.mutate(form); }}
      >
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}

        <div>
          <label className="label">Full Name *</label>
          <input className="input" required value={form.fullName} onChange={f('fullName')} placeholder="Maria Santos" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={f('email')} placeholder="maria@email.com" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={f('phone')} placeholder="+63 917 000 0000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Instagram</label>
            <input className="input" value={form.instagram} onChange={f('instagram')} placeholder="@username" />
          </div>
          <div>
            <label className="label">Referred By</label>
            <input className="input" value={form.referredBy} onChange={f('referredBy')} placeholder="Friend / Instagram / etc." />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <input className="input" value={form.address} onChange={f('address')} />
        </div>

        <div>
          <label className="label">Pipeline Stage</label>
          <select className="input" value={form.pipelineStage} onChange={f('pipelineStage')}>
            <option value="new_inquiry">New Inquiry</option>
            <option value="ocular_scheduled">Ocular Scheduled</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea className="input resize-none" rows={3} value={form.notes} onChange={f('notes')} placeholder="Initial notes about this inquiry…" />
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create Client'}
          </button>
          <Link href="/clients" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
