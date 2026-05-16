'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { peso, fmt, PAYMENT_STATUS } from '@/lib/utils';

const PTYPES = ['downpayment','mid_payment','balance','addon','refund'];
const METHODS = ['Cash','GCash','Bank Transfer','Check'];

export default function PaymentsTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { data: payments = [] } = useQuery({ queryKey: ['payments', eventId], queryFn: () => paymentsApi.getByEvent(eventId).then(r => r.data) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => paymentsApi.delete(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments', eventId] }); toast.success('Payment deleted'); } });

  const totalPaid = (payments as any[]).filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + (p.amount ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Total collected: <span className="text-brand-gold font-bold">{peso(totalPaid)}</span></p>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Payment</Button>
      </div>
      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-500 uppercase">
            {['Type','Amount','Status','Method','Due Date','Paid Date','Ref#',''].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {(payments as any[]).map((p: any) => {
              const st = PAYMENT_STATUS[p.status] ?? { label: p.status, color: '' };
              return (
                <tr key={p.id} className="border-b border-[#0F3460]/20 hover:bg-[#0D1117]/30">
                  <td className="px-4 py-3 capitalize">{p.type?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-medium text-white">{peso(p.amount)}</td>
                  <td className="px-4 py-3"><Badge label={st.label} className={st.color} /></td>
                  <td className="px-4 py-3 text-gray-400">{p.method ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{fmt(p.dueDate)}</td>
                  <td className="px-4 py-3 text-gray-400">{fmt(p.paidDate)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.referenceNo ?? '—'}</td>
                  <td className="px-4 py-3"><button onClick={() => deleteMutation.mutate(p.id)} className="text-gray-600 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {payments.length === 0 && <EmptyState icon={DollarSign} title="No payments recorded" />}
      </div>
      {showAdd && (
        <Modal title="Record Payment" onClose={() => setShowAdd(false)}>
          <AddPaymentForm eventId={eventId} onCreated={() => { qc.invalidateQueries({ queryKey: ['payments', eventId] }); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

function AddPaymentForm({ eventId, onCreated }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: { type:'downpayment', amount:0, status:'pending', method:'GCash', dueDate:'', paidDate:'', referenceNo:'', notes:'' } });
  const mutation = useMutation({ mutationFn: (d: object) => paymentsApi.create({ ...d, eventId }), onSuccess: () => { toast.success('Payment recorded!'); onCreated(); } });
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Payment Type" {...register('type')}>{PTYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_',' ')}</option>)}</Select>
        <Input label="Amount (₱)" type="number" {...register('amount', { valueAsNumber: true })} />
        <Select label="Status" {...register('status')}>{Object.keys(PAYMENT_STATUS).map(s => <option key={s} value={s}>{PAYMENT_STATUS[s].label}</option>)}</Select>
        <Select label="Payment Method" {...register('method')}>{METHODS.map(m => <option key={m} value={m}>{m}</option>)}</Select>
        <Input label="Due Date" type="date" {...register('dueDate')} />
        <Input label="Paid Date" type="date" {...register('paidDate')} />
        <div className="col-span-2"><Input label="Reference No." placeholder="GCash ref, check no…" {...register('referenceNo')} /></div>
        <div className="col-span-2"><Textarea label="Notes" rows={2} {...register('notes')} /></div>
      </div>
      <div className="flex justify-end"><Button type="submit" loading={mutation.isPending}>Save Payment</Button></div>
    </form>
  );
}
