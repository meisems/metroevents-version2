// apps/web/src/app/(dashboard)/events/[id]/tabs/PaymentsTab.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPHP, formatShortDate, isOverdue, PAYMENT_STATUS_COLORS } from '@/lib/utils';

const PAYMENT_TYPES = ['downpayment', 'midpayment', 'balance', 'addon', 'refund'];

export default function PaymentsTab({ event }: { event: any }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    paymentType: 'downpayment',
    label: '',
    amount: '',
    dueDate: '',
    notes: '',
  });

  const { data: payments } = useQuery({
    queryKey: ['payments', event.id],
    queryFn: () => api.get(`/payments/event/${event.id}`).then((r) => r.data),
  });

  const { data: financial } = useQuery({
    queryKey: ['event-financial', event.id],
    queryFn: () => api.get(`/events/${event.id}/financial-summary`).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/payments', { ...data, eventId: event.id, amount: +data.amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', event.id] });
      qc.invalidateQueries({ queryKey: ['event-financial', event.id] });
      setShowForm(false);
      setForm({ paymentType: 'downpayment', label: '', amount: '', dueDate: '', notes: '' });
    },
  });

  const markPaid = useMutation({
    mutationFn: (id: string) => api.patch(`/payments/${id}/mark-paid`, { method: 'bank_transfer' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', event.id] });
      qc.invalidateQueries({ queryKey: ['event-financial', event.id] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/payments/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments', event.id] });
      qc.invalidateQueries({ queryKey: ['event-financial', event.id] });
    },
  });

  return (
    <div className="space-y-5">
      {/* Financial Summary Banner */}
      {financial && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Grand Total', value: financial.grandTotal, color: 'text-gray-800' },
            { label: 'Total Paid', value: financial.totalPaid, color: 'text-green-600' },
            { label: 'Balance Due', value: financial.balanceDue, color: financial.balanceDue > 0 ? 'text-red-600' : 'text-green-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <p className={`text-xl font-bold ${color}`}>{formatPHP(value)}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Payment Schedule</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          + Add Payment
        </button>
      </div>

      {/* Add Payment Form */}
      {showForm && (
        <div className="card p-5 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium text-sm">New Payment Entry</h3>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
            >
              {PAYMENT_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
            <input
              className="input"
              placeholder="Label (e.g. 50% Downpayment)"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              className="input"
              placeholder="Amount (PHP) *"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <textarea
            className="input resize-none"
            placeholder="Notes"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => create.mutate(form)}
              disabled={!form.amount || create.isPending}
            >
              {create.isPending ? 'Saving…' : 'Save'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">Type / Label</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Due Date</th>
              <th className="text-left px-4 py-3">Paid Date</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!payments?.length ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">No payments yet.</td>
              </tr>
            ) : (
              payments.map((p: any) => (
                <tr key={p.id} className={`hover:bg-gray-50 ${isOverdue(p.dueDate) && p.status === 'pending' ? 'bg-red-50/40' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium capitalize">{p.paymentType.replace('_', ' ')}</p>
                    {p.label && <p className="text-xs text-gray-400">{p.label}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatPHP(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.dueDate ? (
                      <span className={isOverdue(p.dueDate) && p.status === 'pending' ? 'text-red-600 font-medium' : ''}>
                        {formatShortDate(p.dueDate)}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.paidDate ? formatShortDate(p.paidDate) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${PAYMENT_STATUS_COLORS[p.status] ?? 'bg-gray-100'} capitalize`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => markPaid.mutate(p.id)}
                          className="text-xs text-green-600 hover:underline font-medium"
                          disabled={markPaid.isPending}
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        onClick={() => remove.mutate(p.id)}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
