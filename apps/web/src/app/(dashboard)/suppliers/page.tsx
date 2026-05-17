// apps/web/src/app/(dashboard)/suppliers/page.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', contactPerson: '', phone: '',
    email: '', address: '', notes: '', isPreferred: false,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers', q, category],
    queryFn: () => api.get('/suppliers', { params: { q: q || undefined, category: category || undefined } }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['supplier-categories'],
    queryFn: () => api.get('/suppliers/categories').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/suppliers', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] });
      setShowForm(false);
      setForm({ name: '', category: '', contactPerson: '', phone: '', email: '', address: '', notes: '', isPreferred: false });
    },
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Suppliers & Vendors</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">+ Add Supplier</button>
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium">New Supplier</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Supplier Name *</label>
              <input className="input" value={form.name} onChange={f('name')} placeholder="e.g. Blooms & Pegs Florals" />
            </div>
            <div>
              <label className="label">Category *</label>
              <input className="input" value={form.category} onChange={f('category')} placeholder="e.g. Florals, Catering, AV" />
            </div>
            <div>
              <label className="label">Contact Person</label>
              <input className="input" value={form.contactPerson} onChange={f('contactPerson')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={f('phone')} placeholder="+63 9XX XXX XXXX" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={f('email')} />
            </div>
            <div>
              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={f('address')} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} value={form.notes} onChange={f('notes')} />
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPreferred}
              onChange={(e) => setForm({ ...form, isPreferred: e.target.checked })}
              className="accent-slate-800"
            />
            Mark as preferred supplier
          </label>
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => create.mutate(form)}
              disabled={!form.name || !form.category || create.isPending}
            >
              {create.isPending ? 'Saving…' : 'Save Supplier'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <input className="input max-w-xs" placeholder="Search suppliers…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories?.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!suppliers?.length ? (
          <div className="col-span-3 text-center py-12 text-gray-400">No suppliers yet.</div>
        ) : (
          suppliers.map((s: any) => (
            <div key={s.id} className="card p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{s.name}</p>
                  <span className="badge bg-slate-100 text-slate-600 text-xs">{s.category}</span>
                </div>
                {s.isPreferred && <span className="text-amber-500 text-lg" title="Preferred">⭐</span>}
              </div>
              {s.contactPerson && <p className="text-sm text-gray-600 mt-2">👤 {s.contactPerson}</p>}
              {s.phone && <p className="text-sm text-gray-600">📞 {s.phone}</p>}
              {s.email && <p className="text-sm text-gray-600">✉️ {s.email}</p>}
              {s.notes && <p className="text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2">{s.notes}</p>}
              <p className="text-xs text-gray-400 mt-2">{s._count?.purchaseOrders ?? 0} purchase orders</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
