'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Package, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { fmt } from '@/lib/utils';

export default function InventoryTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showReserve, setShowReserve] = useState(false);
  const { data: reservations = [] } = useQuery({ queryKey: ['reservations', eventId], queryFn: () => inventoryApi.getReservations(eventId).then(r => r.data) });

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowReserve(true)}><Plus className="w-4 h-4" /> Reserve Item</Button></div>
      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-500 uppercase">
            {['Item','Qty','Date','Status','Notes'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {(reservations as any[]).map((r: any) => (
              <tr key={r.id} className="border-b border-[#0F3460]/20 hover:bg-[#0D1117]/30">
                <td className="px-4 py-3 text-white">{r.itemName ?? r.inventoryItemId}</td>
                <td className="px-4 py-3 text-gray-300">{r.qty}</td>
                <td className="px-4 py-3 text-gray-400">{fmt(r.reservedDate)}</td>
                <td className="px-4 py-3 text-gray-400 capitalize">{r.status}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{r.notes ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {reservations.length === 0 && <EmptyState icon={Package} title="No items reserved" sub="Reserve inventory items for this event." />}
      </div>
      {showReserve && (
        <Modal title="Reserve Inventory Item" onClose={() => setShowReserve(false)}>
          <ReserveForm eventId={eventId} onCreated={() => { qc.invalidateQueries({ queryKey: ['reservations', eventId] }); setShowReserve(false); }} />
        </Modal>
      )}
    </div>
  );
}

function ReserveForm({ eventId, onCreated }: any) {
  const { data: items = [] } = useQuery({ queryKey: ['inventory'], queryFn: () => inventoryApi.list().then(r => r.data) });
  const { register, handleSubmit } = useForm({ defaultValues: { inventoryItemId:'', qty:1, reservedDate:'' } });
  const mutation = useMutation({ mutationFn: (d: object) => inventoryApi.reserve({ ...d, eventId }), onSuccess: () => { toast.success('Item reserved!'); onCreated(); } });
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <Select label="Inventory Item" {...register('inventoryItemId')}>
        <option value="">— Select item —</option>
        {(items as any[]).map((i: any) => <option key={i.id} value={i.id}>{i.name} ({i.sku}) — {i.availableQty} available</option>)}
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Quantity" type="number" min={1} {...register('qty', { valueAsNumber: true })} />
        <Input label="Event Date" type="date" {...register('reservedDate')} />
      </div>
      <div className="flex justify-end"><Button type="submit" loading={mutation.isPending}>Reserve</Button></div>
    </form>
  );
}
