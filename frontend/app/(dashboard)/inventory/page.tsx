'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { inventoryApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Package, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';

const CATEGORIES = ['Backdrop','Draping','Lights','Flowers','Furniture','Tableware','Linen','Signage','Props','Equipment','Other'];
const CONDITIONS: Record<string, string> = { Excellent:'text-green-400', Good:'text-teal-400', Fair:'text-yellow-400', Damaged:'text-orange-400', Missing:'text-red-400' };

export default function InventoryPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['inventory', search, category],
    queryFn: () => inventoryApi.list({ search: search || undefined, category: category || undefined }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search inventory…"
            className="w-full pl-9 pr-4 py-2 bg-[#16213E] border border-[#0F3460]/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
        </div>
        <Select value={category} onChange={e => setCategory(e.target.value)} className="w-auto">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? [...Array(8)].map((_,i) => <div key={i} className="h-44 bg-[#16213E] rounded-xl animate-pulse border border-[#0F3460]/30" />) :
          (items as any[]).map((item: any) => (
            <div key={item.id} onClick={() => setSelected(item)} className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-4 hover:border-brand-gold/30 cursor-pointer transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.sku}</p>
                </div>
                <Badge label={item.category} className="bg-[#0D1117] text-gray-400 border-[#0F3460]/60 text-[10px]" />
              </div>
              <div className="flex gap-4 mt-3 text-xs text-gray-500">
                <div><span className="text-white font-bold text-base">{item.availableQty}</span>/{item.totalQty} avail</div>
                <div className={CONDITIONS[item.condition] ?? 'text-gray-400'}>{item.condition}</div>
              </div>
              {item.location && <p className="text-xs text-gray-600 mt-2">📍 {item.location}</p>}
            </div>
          ))
        }
      </div>
      {!isLoading && items.length === 0 && <EmptyState icon={Package} title="No inventory items" sub="Add your first item to the catalog." />}

      {showCreate && <AddItemModal onClose={() => setShowCreate(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['inventory'] }); setShowCreate(false); }} />}
    </div>
  );
}

function AddItemModal({ onClose, onCreated }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: { name:'', sku:'', category:'Props', totalQty:1, location:'', condition:'Good', replacementCost:0, rentalPrice:0 } });
  const mutation = useMutation({ mutationFn: inventoryApi.create, onSuccess: () => { toast.success('Item added!'); onCreated(); } });
  return (
    <Modal title="Add Inventory Item" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Item Name *" placeholder="Gold Candelabra" {...register('name')} /></div>
          <Input label="SKU" placeholder="GC-001" {...register('sku')} />
          <Select label="Category" {...register('category')}>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</Select>
          <Input label="Total Quantity" type="number" min={1} {...register('totalQty', { valueAsNumber: true })} />
          <Select label="Condition" {...register('condition')}>{Object.keys(CONDITIONS).map(c => <option key={c} value={c}>{c}</option>)}</Select>
          <Input label="Storage Location" placeholder="Warehouse A, Shelf 2" {...register('location')} />
          <Input label="Replacement Cost (₱)" type="number" {...register('replacementCost', { valueAsNumber: true })} />
          <Input label="Rental Price (₱)" type="number" {...register('rentalPrice', { valueAsNumber: true })} />
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button type="submit" loading={mutation.isPending}>Add Item</Button></div>
      </form>
    </Modal>
  );
}
