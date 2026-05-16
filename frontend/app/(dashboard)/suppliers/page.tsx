'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { suppliersApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Truck, Plus, Search, Star, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CATEGORIES = ['Catering','Flowers','Lights & Sound','Photography','Videography','Venue','Cake','Hair & Makeup','Transport','Printing','Entertainment','Other'];

export default function SuppliersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers', search, category],
    queryFn: () => suppliersApi.list({ search: search || undefined, category: category || undefined }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search suppliers…"
            className="w-full pl-9 pr-4 py-2 bg-[#16213E] border border-[#0F3460]/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none" />
        </div>
        <Select value={category} onChange={e => setCategory(e.target.value)} className="w-auto">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Supplier</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? [...Array(6)].map((_,i) => <div key={i} className="h-44 bg-[#16213E] rounded-xl animate-pulse border border-[#0F3460]/30" />) :
          (suppliers as any[]).map((s: any) => {
            const total = (s.onTimeCount ?? 0) + (s.lateCount ?? 0);
            const reliability = total > 0 ? Math.round((s.onTimeCount / total) * 100) : null;
            return (
              <div key={s.id} className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5 hover:border-brand-gold/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2"><p className="font-semibold text-white">{s.companyName}</p>{s.isPreferred && <CheckCircle className="w-4 h-4 text-brand-gold" />}</div>
                    <p className="text-xs text-gray-500">{s.category}</p>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-400 text-xs"><Star className="w-3 h-3 fill-yellow-400" /> {Number(s.rating).toFixed(1)}</div>
                </div>
                <div className="text-sm text-gray-400 space-y-0.5 mb-3">
                  {s.contactPerson && <p>👤 {s.contactPerson}</p>}
                  {s.phone && <p>📞 {s.phone}</p>}
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-800 text-xs">
                  <div className="text-center flex-1"><p className="text-lg font-bold text-green-400">{s.onTimeCount}</p><p className="text-gray-500">On-time</p></div>
                  <div className="text-center flex-1"><p className="text-lg font-bold text-red-400">{s.lateCount}</p><p className="text-gray-500">Late</p></div>
                  <div className="text-center flex-1"><p className="text-lg font-bold text-brand-gold">{reliability !== null ? `${reliability}%` : '—'}</p><p className="text-gray-500">Reliability</p></div>
                </div>
              </div>
            );
          })
        }
      </div>
      {!isLoading && suppliers.length === 0 && <EmptyState icon={Truck} title="No suppliers found" sub="Add your first supplier." />}
      {showCreate && <AddSupplierModal onClose={() => setShowCreate(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['suppliers'] }); setShowCreate(false); }} />}
    </div>
  );
}

function AddSupplierModal({ onClose, onCreated }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: { companyName:'', contactPerson:'', category:'Flowers', email:'', phone:'', address:'', rating:5, isPreferred:false } });
  const mutation = useMutation({ mutationFn: suppliersApi.create, onSuccess: () => { toast.success('Supplier added!'); onCreated(); } });
  return (
    <Modal title="Add Supplier" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Company Name *" placeholder="ABC Flowers" {...register('companyName')} /></div>
          <Input label="Contact Person" placeholder="Juan dela Cruz" {...register('contactPerson')} />
          <Select label="Category" {...register('category')}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</Select>
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Phone" placeholder="+63 917…" {...register('phone')} />
          <div className="col-span-2"><Input label="Address" {...register('address')} /></div>
          <Input label="Initial Rating (1-5)" type="number" min={1} max={5} step={0.1} {...register('rating', { valueAsNumber: true })} />
          <div className="flex items-center gap-2 self-end pb-2"><input type="checkbox" {...register('isPreferred')} className="w-4 h-4 accent-brand-gold" /><label className="text-sm text-gray-300">Preferred Supplier</label></div>
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button type="submit" loading={mutation.isPending}>Add Supplier</Button></div>
      </form>
    </Modal>
  );
}
