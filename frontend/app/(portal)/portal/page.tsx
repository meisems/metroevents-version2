'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { portalApi } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea, Input } from '@/components/ui/Input';
import { EVENT_STATUSES, PAYMENT_STATUS, peso, fmt } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { CheckCircle, Star, Image, DollarSign, FileText, Heart } from 'lucide-react';

export default function PortalPage() {
  const [tab, setTab] = useState('Overview');
  const [showFeedback, setShowFeedback] = useState(false);

  const { data: event } = useQuery({ queryKey: ['portal-event'], queryFn: () => portalApi.getMyEvent().then(r => r.data) });
  const { data: quote } = useQuery({ queryKey: ['portal-quote'], queryFn: () => portalApi.getQuote().then(r => r.data) });
  const { data: payments = [] } = useQuery({ queryKey: ['portal-payments'], queryFn: () => portalApi.getPayments().then(r => r.data) });
  const { data: moodboard = [] } = useQuery({ queryKey: ['portal-moodboard'], queryFn: () => portalApi.getMoodboard().then(r => r.data) });

  const approveMutation = useMutation({ mutationFn: (id: string) => portalApi.approveQuote(id), onSuccess: () => { toast.success('Quote approved! 🎉'); } });

  const st = event ? EVENT_STATUSES[event.status] : null;
  const totalPaid = (payments as any[]).filter((p: any) => p.status === 'paid').reduce((s: number, p: any) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Event header */}
      {event && (
        <div className="bg-[#16213E] rounded-2xl border border-[#0F3460]/50 p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-rose-400" />
                <h1 className="text-xl font-bold text-white">{event.title}</h1>
                {st && <Badge label={st.label} className={st.color} />}
              </div>
              <p className="text-gray-400 text-sm">📅 {fmt(event.eventDate)} · 📍 {event.venue}</p>
            </div>
            {event.status === 'done' && <Button variant="outline" onClick={() => setShowFeedback(true)}><Star className="w-4 h-4 text-yellow-400" /> Leave a Review</Button>}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#16213E] border border-[#0F3460]/50 rounded-xl p-1">
        {[['Overview', Heart], ['Quote', FileText], ['Payments', DollarSign], ['Moodboard', Image]].map(([t, Icon]: any) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-brand-gold text-white' : 'text-gray-400 hover:text-white'}`}>
            <Icon className="w-3.5 h-3.5" />{t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && event && (
        <div className="grid grid-cols-2 gap-4">
          {[['Event Date', fmt(event.eventDate)], ['Venue', event.venue], ['Type', event.type], ['Guests', event.guestCount], ['Total Amount', peso(event.totalAmount)], ['Amount Paid', peso(totalPaid)]].map(([k, v]) => v ? (
            <div key={k as string} className="bg-[#16213E] rounded-xl border border-[#0F3460]/40 p-4">
              <p className="text-xs text-gray-500 mb-1">{k}</p>
              <p className="font-semibold text-white capitalize">{String(v)}</p>
            </div>
          ) : null)}
        </div>
      )}

      {/* Quote */}
      {tab === 'Quote' && (
        <div className="space-y-4">
          {!quote ? <p className="text-gray-500 text-center py-8">No quote available yet.</p> : (
            <>
              <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-500 uppercase">
                    {['Item','Category','Qty','Unit','Price','Total'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(quote.items ?? []).map((item: any) => (
                      <tr key={item.id} className="border-b border-[#0F3460]/20">
                        <td className="px-4 py-3 text-white">{item.itemName}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{item.category}</td>
                        <td className="px-4 py-3 text-gray-300">{item.qty}</td>
                        <td className="px-4 py-3 text-gray-400">{item.unit}</td>
                        <td className="px-4 py-3 text-gray-300">{peso(item.unitPrice)}</td>
                        <td className="px-4 py-3 font-medium text-white">{peso(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5 max-w-xs ml-auto space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Subtotal</span><span>{peso(quote.subtotal)}</span></div>
                {quote.discount > 0 && <div className="flex justify-between"><span className="text-gray-400">Discount</span><span className="text-red-400">- {peso(quote.discount)}</span></div>}
                <div className="flex justify-between font-bold border-t border-[#0F3460]/40 pt-2"><span className="text-white">Grand Total</span><span className="text-brand-gold text-lg">{peso(quote.grandTotal)}</span></div>
              </div>
              {quote.status === 'sent' && (
                <div className="flex justify-center">
                  <Button onClick={() => approveMutation.mutate(quote.id)} loading={approveMutation.isPending}><CheckCircle className="w-4 h-4" /> Approve This Quote</Button>
                </div>
              )}
              {quote.status === 'approved' && <p className="text-center text-green-400 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> You approved this quote on {fmt(quote.approvedAt)}</p>}
            </>
          )}
        </div>
      )}

      {/* Payments */}
      {tab === 'Payments' && (
        <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-500 uppercase">
              {['Type','Amount','Status','Method','Due','Paid'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {(payments as any[]).map((p: any) => {
                const st = PAYMENT_STATUS[p.status] ?? { label: p.status, color: '' };
                return (
                  <tr key={p.id} className="border-b border-[#0F3460]/20">
                    <td className="px-4 py-3 capitalize">{p.type?.replace('_', ' ')}</td>
                    <td className="px-4 py-3 font-medium text-white">{peso(p.amount)}</td>
                    <td className="px-4 py-3"><Badge label={st.label} className={st.color} /></td>
                    <td className="px-4 py-3 text-gray-400">{p.method ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{fmt(p.dueDate)}</td>
                    <td className="px-4 py-3 text-gray-400">{fmt(p.paidDate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payments.length === 0 && <p className="text-center text-gray-500 py-8">No payments yet.</p>}
        </div>
      )}

      {/* Moodboard */}
      {tab === 'Moodboard' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(moodboard as any[]).map((peg: any) => (
            <div key={peg.id} className="rounded-xl border border-[#0F3460]/40 overflow-hidden bg-[#16213E]">
              <div className="aspect-square flex items-center justify-center bg-[#0D1117]">
                {peg.imageUrl ? <img src={peg.imageUrl} alt={peg.category} className="w-full h-full object-cover" /> : <Image className="w-8 h-8 text-gray-600" />}
              </div>
              <div className="p-2.5">
                <p className="text-xs text-gray-400">{peg.category}</p>
                {peg.isApproved && <p className="text-[10px] text-brand-gold">✓ Approved</p>}
              </div>
            </div>
          ))}
          {moodboard.length === 0 && <div className="col-span-3 text-center text-gray-500 py-10">No moodboard pegs yet.</div>}
        </div>
      )}

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [stars, setStars] = useState(5);
  const { register, handleSubmit } = useForm({ defaultValues: { comment: '', wouldRecommend: true } });
  const mutation = useMutation({ mutationFn: (d: object) => portalApi.submitFeedback(d), onSuccess: () => { toast.success('Thank you for your feedback! 🌟'); onClose(); } });
  return (
    <Modal title="⭐ Leave Your Review" onClose={onClose}>
      <form onSubmit={handleSubmit(d => mutation.mutate({ ...d, rating: stars }))} className="space-y-4">
        <div>
          <p className="text-xs text-gray-400 mb-2">Overall Rating</p>
          <div className="flex gap-2">{[1,2,3,4,5].map(s => (
            <button key={s} type="button" onClick={() => setStars(s)} className={`text-3xl transition ${s <= stars ? 'text-yellow-400' : 'text-gray-600'}`}>★</button>
          ))}</div>
        </div>
        <Textarea label="Your Review" rows={4} placeholder="Share your experience with Metro Events…" {...register('comment')} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="rec" {...register('wouldRecommend')} className="w-4 h-4 accent-brand-gold" defaultChecked />
          <label htmlFor="rec" className="text-sm text-gray-300">I would recommend Metro Events to friends & family</label>
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button type="submit" loading={mutation.isPending}>Submit Review</Button></div>
      </form>
    </Modal>
  );
}
