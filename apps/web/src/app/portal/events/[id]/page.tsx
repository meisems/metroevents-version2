// apps/web/src/app/portal/events/[id]/page.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, formatPHP, PAYMENT_STATUS_COLORS } from '@/lib/utils';

export default function PortalEventPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<'details' | 'moodboard' | 'proposal' | 'payments' | 'feedback'>('details');
  const [feedbackForm, setFeedbackForm] = useState({
    ratingOverall: 5, ratingDesign: 5, ratingCoordination: 5,
    ratingOnTime: 5, ratingValue: 5, clientFeedback: '', wouldRecommend: true,
  });

  const { data: event } = useQuery({
    queryKey: ['portal-event', params.id],
    queryFn: () => api.get(`/events/${params.id}`).then((r) => r.data),
  });

  const { data: afterEvent } = useQuery({
    queryKey: ['after-event', params.id],
    queryFn: () => api.get(`/after-events/event/${params.id}`).then((r) => r.data),
    enabled: !!event,
  });

  const { data: payments } = useQuery({
    queryKey: ['portal-payments', params.id],
    queryFn: () => api.get(`/payments/event/${params.id}`).then((r) => r.data),
    enabled: !!event,
  });

  const { data: pegs } = useQuery({
    queryKey: ['portal-moodboard', params.id],
    queryFn: () => api.get(`/moodboard/event/${params.id}`).then((r) => r.data),
    enabled: !!event,
  });

  const submitFeedback = useMutation({
    mutationFn: (data: any) =>
      api.post(`/after-events/event/${params.id}/client-feedback`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['after-event', params.id] }),
  });

  const approveQuote = useMutation({
    mutationFn: (quoteId: string) => api.patch(`/quotes/${quoteId}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal-event', params.id] }),
  });

  const TABS = [
    { id: 'details', label: '📋 Details' },
    { id: 'moodboard', label: '🎨 Moodboard' },
    { id: 'proposal', label: '📄 Proposal' },
    { id: 'payments', label: '💸 Payments' },
    ...(event?.status === 'done' ? [{ id: 'feedback', label: '⭐ Feedback' }] : []),
  ] as const;

  if (!event) return <div className="animate-pulse space-y-4"><div className="h-48 bg-gray-200 rounded-xl" /></div>;

  const activeQuote = event.quotes?.find((q: any) => q.isActive) ?? event.quotes?.[0];
  const clientFiles = event.files?.filter((f: any) => f.isClientVisible) ?? [];

  return (
    <div className="space-y-0">
      {/* Event Hero */}
      <div className="bg-slate-900 text-white rounded-2xl p-7 mb-6">
        <Link href="/portal" className="text-slate-400 text-sm hover:text-white">← My Events</Link>
        <h1 className="text-2xl font-bold mt-2">{event.name}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {formatDate(event.eventDate)}
          {event.venueName && ` · ${event.venueName}`}
        </p>
        {event.colorPalette && (
          <p className="text-amber-400 text-sm mt-1">🎨 {event.colorPalette}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div className="space-y-5">
          <div className="card p-6">
            <h2 className="font-semibold mb-4">Event Information</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Event Date', value: formatDate(event.eventDate) },
                { label: 'Venue', value: event.venueName ?? '—' },
                { label: 'Color Palette', value: event.colorPalette ?? '—' },
                { label: 'Package', value: event.packageName ?? '—' },
                { label: 'Coordinator', value: event.coordinator?.name ?? '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-gray-500 text-xs">{label}</dt>
                  <dd className="font-medium mt-0.5">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Shared Files */}
          {clientFiles.length > 0 && (
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Documents</h2>
              <div className="space-y-2">
                {clientFiles.map((f: any) => (
                  <a
                    key={f.id}
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium">{f.originalFilename}</p>
                      <p className="text-xs text-gray-400 capitalize">{f.category?.replace('_', ' ')}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Moodboard Tab */}
      {activeTab === 'moodboard' && (
        <div className="space-y-4">
          <h2 className="font-semibold">Design Pegs & Inspiration</h2>
          {!pegs?.length ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">🎨</p>
              <p>Your design moodboard will appear here once your coordinator adds pegs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {pegs.map((peg: any) => (
                <div key={peg.id} className="rounded-xl overflow-hidden bg-gray-100 aspect-square relative">
                  <img src={peg.imageUrl} alt={peg.caption ?? ''} className="w-full h-full object-cover" />
                  {peg.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-xs p-2">
                      {peg.caption}
                    </div>
                  )}
                  {peg.isApproved && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">✓ Approved</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Proposal Tab */}
      {activeTab === 'proposal' && (
        <div className="space-y-4">
          {!activeQuote ? (
            <div className="text-center py-12 text-gray-400">Proposal is being prepared. Check back soon!</div>
          ) : (
            <div className="card overflow-hidden">
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Proposal v{activeQuote.version}</h2>
                  {activeQuote.packageName && <p className="text-slate-400 text-sm">{activeQuote.packageName}</p>}
                </div>
                {activeQuote.isApproved ? (
                  <span className="badge bg-green-500 text-white">✓ Approved by you</span>
                ) : (
                  <button
                    onClick={() => approveQuote.mutate(activeQuote.id)}
                    disabled={approveQuote.isPending}
                    className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-400 transition-colors"
                  >
                    {approveQuote.isPending ? 'Approving…' : 'Approve Proposal'}
                  </button>
                )}
              </div>

              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium text-gray-600">Item</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Qty</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeQuote.items?.filter((i: any) => !i.isAddon).map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-5 py-3">
                        <p className="font-medium">{item.itemName}</p>
                        {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatPHP(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-gray-200 px-5 py-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>{formatPHP(activeQuote.subtotal)}</span>
                </div>
                {Number(activeQuote.discountValue) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span><span>-{formatPHP(activeQuote.discountValue)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t border-gray-200 pt-2">
                  <span>Grand Total</span><span>{formatPHP(activeQuote.grandTotal)}</span>
                </div>
              </div>

              {activeQuote.inclusionsNote && (
                <div className="px-5 py-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Inclusions Note</p>
                  <p className="text-sm text-gray-700">{activeQuote.inclusionsNote}</p>
                </div>
              )}
              {activeQuote.termsNote && (
                <div className="px-5 py-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Terms & Conditions</p>
                  <p className="text-sm text-gray-700">{activeQuote.termsNote}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <h2 className="font-semibold">Payment Schedule</h2>
          {!payments?.length ? (
            <div className="text-center py-10 text-gray-400">No payment entries yet.</div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Due</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p: any) => (
                    <tr key={p.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium capitalize">{p.paymentType.replace('_', ' ')}</p>
                        {p.label && <p className="text-xs text-gray-400">{p.label}</p>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{formatPHP(p.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{p.dueDate ? formatDate(p.dueDate) : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${PAYMENT_STATUS_COLORS[p.status] ?? 'bg-gray-100'} capitalize`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Feedback Tab */}
      {activeTab === 'feedback' && (
        <div className="space-y-5 max-w-xl">
          {afterEvent?.submittedByClient ? (
            <div className="card p-6 text-center">
              <p className="text-4xl mb-3">🌸</p>
              <h2 className="text-lg font-semibold mb-1">Thank you for your feedback!</h2>
              <p className="text-gray-500 text-sm">Your review means a lot to the Metro Events team.</p>
            </div>
          ) : (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold">How was your experience?</h2>
              {[
                { key: 'ratingOverall', label: 'Overall Experience' },
                { key: 'ratingDesign', label: 'Design & Aesthetics' },
                { key: 'ratingCoordination', label: 'Coordination' },
                { key: 'ratingOnTime', label: 'On-Time Setup' },
                { key: 'ratingValue', label: 'Value for Money' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setFeedbackForm({ ...feedbackForm, [key]: n })}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          n <= (feedbackForm as any)[key] ? 'text-amber-400' : 'text-gray-200'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <label className="label">Your Comments</label>
                <textarea
                  className="input resize-none"
                  rows={4}
                  placeholder="Tell us about your experience…"
                  value={feedbackForm.clientFeedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, clientFeedback: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={feedbackForm.wouldRecommend}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, wouldRecommend: e.target.checked })}
                  className="accent-slate-800"
                />
                I would recommend Metro Events to friends and family
              </label>

              <button
                className="btn-primary w-full"
                onClick={() => submitFeedback.mutate(feedbackForm)}
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
