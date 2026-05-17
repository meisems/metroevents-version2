// apps/web/src/app/(dashboard)/inventory/page.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function InventoryPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', totalQty: '', availableQty: '', unit: 'pc', description: '', condition: 'good',
  });

  const { data: items } = useQuery({
    queryKey: ['inventory', q, category],
    queryFn: () => api.get('/inventory', { params: { q: q || undefined, category: category || undefined } }).then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: () => api.get('/inventory/categories').then((r) => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: () => api.get('/inventory/low-stock').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/inventory', { ...data, totalQty: +data.totalQty, availableQty: +data.availableQty }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      setShowForm(false);
      setForm({ name: '', category: '', totalQty: '', availableQty: '', unit: 'pc', description: '', condition: 'good' });
    },
  });

  const canManage = ['admin', 'warehouse'].includes(user?.role ?? '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventory</h1>
        {canManage && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
            + Add Item
          </button>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStock?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">⚠️ Low Stock Alert</h3>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item: any) => (
              <span key={item.id} className="badge bg-amber-100 text-amber-700">
                {item.name} — {item.availableQty} left
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showForm && (
        <div className="card p-5 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium text-sm">New Inventory Item</h3>
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="Item name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="input" placeholder="Category *" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input type="number" className="input" placeholder="Total Qty" value={form.totalQty} onChange={(e) => setForm({ ...form, totalQty: e.target.value })} />
            <input type="number" className="input" placeholder="Available Qty" value={form.availableQty} onChange={(e) => setForm({ ...form, availableQty: e.target.value })} />
            <input className="input" placeholder="Unit (pc, set, …)" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
            <select className="input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="needs_repair">Needs Repair</option>
            </select>
          </div>
          <textarea className="input resize-none" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2">
            <button className="btn-primary text-sm" onClick={() => create.mutate(form)} disabled={!form.name || create.isPending}>
              {create.isPending ? 'Saving…' : 'Save Item'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <input className="input max-w-xs" placeholder="Search inventory…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[200px]" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories?.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Items Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Item</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-right px-4 py-3">Available</th>
              <th className="text-left px-4 py-3">Unit</th>
              <th className="text-left px-4 py-3">Condition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!items?.length ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No items found.</td></tr>
            ) : (
              items.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.name}</p>
                    {item.description && <p className="text-xs text-gray-400 line-clamp-1">{item.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{item.category}</td>
                  <td className="px-4 py-3 text-right font-medium">{item.totalQty}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-medium ${item.availableQty <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {item.availableQty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.unit}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{item.condition?.replace('_', ' ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
