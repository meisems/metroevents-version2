'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { peso, fmt } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const ITEM_UNITS = ['pc','set','lot','hr','day','pax'];
const ITEM_CATS = ['Venue','Catering','Florals','Backdrop','Lighting','Sound','Photography','Videography','Coordination','Transport','Misc'];

export default function QuoteTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const { data: quotes = [], isLoading } = useQuery({ queryKey: ['quotes', eventId], queryFn: () => quotesApi.getByEvent(eventId).then(r => r.data) });
  const [activeIdx, setActiveIdx] = useState(0);
  const quote = (quotes as any[])[activeIdx];

  const approveMutation = useMutation({ mutationFn: (id: string) => quotesApi.approve(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['quotes', eventId] }); toast.success('Quote approved!'); } });
  const removeItemMutation = useMutation({ mutationFn: ({ qid, iid }: any) => quotesApi.removeItem(qid, iid), onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', eventId] }) });

  const statusColors: Record<string, string> = { draft:'bg-gray-500/20 text-gray-300 border-gray-500/30', sent:'bg-sky-500/20 text-sky-300 border-sky-500/30', approved:'bg-green-500/20 text-green-300 border-green-500/30', rejected:'bg-red-500/20 text-red-300 border-red-500/30' };

  return (
    <div className="space-y-4">
      {/* Version tabs */}
      {(quotes as any[]).length > 0 && (
        <div className="flex gap-2 items-center flex-wrap">
          {(quotes as any[]).map((q: any, i: number) => (
            <button key={q.id} onClick={() => setActiveIdx(i)} className={`px-3 py-1.5 rounded-lg text-xs border transition ${i === activeIdx ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 'bg-[#16213E] border-[#0F3460]/40 text-gray-400'}`}>
              v{q.version} <Badge label={q.status} className={statusColors[q.status]} />
            </button>
          ))}
          <Button variant="outline" onClick={() => setShowCreate(true)} className="text-xs"><Plus className="w-3 h-3" /> New Version</Button>
        </div>
      )}

      {isLoading ? <div className="h-32 bg-[#16213E] rounded-xl animate-pulse" /> :
        !quote ? (
          <div className="text-center py-12">
            <EmptyState icon={FileText} title="No quote yet" sub="Create the first version." />
            <Button onClick={() => setShowCreate(true)} className="mt-4"><Plus className="w-4 h-4" /> Create Quote</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Items table */}
            <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#0F3460]/40">
                <h3 className="font-semibold text-white">Line Items</h3>
                <Button variant="outline" onClick={() => setShowAddItem(true)} className="text-xs"><Plus className="w-3 h-3" /> Add Item</Button>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#0F3460]/30 text-xs text-gray-500">
                  {['Category','Item','Qty','Unit','Unit Price','Total',''].map(h => <th key={h} className="px-4 py-2 text-left">{h}</th>)}
                </tr></thead>
                <tbody>
                  {(quote.items ?? []).map((item: any) => (
                    <tr key={item.id} className="border-b border-[#0F3460]/20 hover:bg-[#0D1117]/30">
                      <td className="px-4 py-2 text-gray-400 text-xs">{item.category}</td>
                      <td className="px-4 py-2 text-white">{item.itemName}</td>
                      <td className="px-4 py-2 text-gray-300">{item.qty}</td>
                      <td className="px-4 py-2 text-gray-400">{item.unit}</td>
                      <td className="px-4 py-2 text-gray-300">{peso(item.unitPrice)}</td>
                      <td className="px-4 py-2 text-white font-medium">{peso(item.total)}</td>
                      <td className="px-4 py-2"><button onClick={() => removeItemMutation.mutate({ qid: quote.id, iid: item.id })} className="text-gray-600 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5 max-w-sm ml-auto space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white">{peso(quote.subtotal)}</span></div>
              {quote.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-red-400">- {peso(quote.discount)}</span></div>}
              {quote.tax > 0 && <div className="flex justify-between"><span className="text-gray-400">Tax ({quote.tax}%)</span><span className="text-gray-300">{peso((quote.grandTotal - quote.subtotal + quote.discount))}</span></div>}
              <div className="flex justify-between border-t border-[#0F3460]/40 pt-2 font-bold"><span className="text-white">Grand Total</span><span className="text-brand-gold text-lg">{peso(quote.grandTotal)}</span></div>
            </div>

            {/* Actions */}
            {quote.status !== 'approved' && (
              <div className="flex justify-end gap-2">
                <Button onClick={() => approveMutation.mutate(quote.id)} loading={approveMutation.isPending}><CheckCircle className="w-4 h-4" /> Approve Quote</Button>
              </div>
            )}
            {quote.status === 'approved' && (
              <div className="flex items-center gap-2 text-green-400 text-sm"><CheckCircle className="w-4 h-4" /> Approved {quote.approvedAt ? fmt(quote.approvedAt) : ''}</div>
            )}
          </div>
        )
      }

      {showCreate && <CreateQuoteModal eventId={eventId} onClose={() => setShowCreate(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['quotes', eventId] }); setShowCreate(false); }} />}
      {showAddItem && quote && (
        <Modal title="Add Line Item" onClose={() => setShowAddItem(false)}>
          <AddItemForm quoteId={quote.id} onCreated={() => { qc.invalidateQueries({ queryKey: ['quotes', eventId] }); setShowAddItem(false); }} />
        </Modal>
      )}
    </div>
  );
}

function CreateQuoteModal({ eventId, onClose, onCreated }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: { discount:0, discountType:'fixed', tax:0, downpayment:0, downpaymentDue:'', balanceDue:'', inclusions:'', exclusions:'', terms:'' } });
  const mutation = useMutation({ mutationFn: (d: object) => quotesApi.create({ ...d, eventId }), onSuccess: () => { toast.success('Quote created!'); onCreated(); } });
  return (
    <Modal title="New Quote Version" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Discount Amount" type="number" {...register('discount')} />
          <Select label="Discount Type" {...register('discountType')}><option value="fixed">Fixed (₱)</option><option value="percent">Percentage (%)</option></Select>
          <Input label="Tax (%)" type="number" {...register('tax')} />
          <Input label="Downpayment" type="number" {...register('downpayment')} />
          <Input label="Downpayment Due" type="date" {...register('downpaymentDue')} />
          <Input label="Balance Due" type="date" {...register('balanceDue')} />
          <div className="col-span-2"><Textarea label="Inclusions" rows={2} {...register('inclusions')} /></div>
          <div className="col-span-2"><Textarea label="Exclusions" rows={2} {...register('exclusions')} /></div>
          <div className="col-span-2"><Textarea label="Terms & Conditions" rows={3} {...register('terms')} /></div>
        </div>
        <div className="flex justify-end gap-2"><Button type="submit" loading={mutation.isPending}>Create Quote</Button></div>
      </form>
    </Modal>
  );
}

function AddItemForm({ quoteId, onCreated }: any) {
  const { register, handleSubmit, watch } = useForm({ defaultValues: { category:'Florals', itemName:'', qty:1, unit:'set', unitPrice:0 } });
  const mutation = useMutation({ mutationFn: (d: any) => quotesApi.addItem(quoteId, { ...d, total: d.qty * d.unitPrice }), onSuccess: () => { toast.success('Item added!'); onCreated(); } });
  const qty = watch('qty'); const price = watch('unitPrice');
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Category" {...register('category')}>{ITEM_CATS.map(c => <option key={c} value={c}>{c}</option>)}</Select>
        <div className="col-span-2"><Input label="Item Name *" placeholder="Premium white roses" {...register('itemName')} /></div>
        <Input label="Quantity" type="number" {...register('qty', { valueAsNumber: true })} />
        <Select label="Unit" {...register('unit')}>{ITEM_UNITS.map(u => <option key={u} value={u}>{u}</option>)}</Select>
        <Input label="Unit Price (₱)" type="number" {...register('unitPrice', { valueAsNumber: true })} />
        <div className="flex items-end pb-2"><p className="text-sm text-gray-400">Total: <span className="text-brand-gold font-bold">{peso((qty || 0) * (price || 0))}</span></p></div>
      </div>
      <div className="flex justify-end"><Button type="submit" loading={mutation.isPending}>Add Item</Button></div>
    </form>
  );
}
