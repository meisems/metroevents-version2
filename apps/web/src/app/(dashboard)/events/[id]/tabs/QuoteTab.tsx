// apps/web/src/app/(dashboard)/events/[id]/tabs/QuoteTab.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatPHP } from '@/lib/utils';

export default function QuoteTab({ event }: { event: any }) {
  const qc = useQueryClient();
  const [showNewItem, setShowNewItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    itemName: '', category: '', quantity: '1', unitPrice: '', unit: 'pc', description: '', isAddon: false,
  });

  const { data: quotes } = useQuery({
    queryKey: ['quotes', event.id],
    queryFn: () => api.get(`/quotes/event/${event.id}`).then((r) => r.data),
  });

  const activeQuote = quotes?.find((q: any) => q.isActive) ?? quotes?.[0];

  const createQuote = useMutation({
    mutationFn: () => api.post('/quotes', { eventId: event.id, packageName: event.packageName }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', event.id] }),
  });

  const addItem = useMutation({
    mutationFn: (data: any) => api.post(`/quotes/${activeQuote.id}/items`, {
      ...data,
      quantity: +data.quantity,
      unitPrice: +data.unitPrice,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['quotes', event.id] });
      setShowNewItem(false);
      setItemForm({ itemName: '', category: '', quantity: '1', unitPrice: '', unit: 'pc', description: '', isAddon: false });
    },
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => api.delete(`/quotes/items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', event.id] }),
  });

  const approve = useMutation({
    mutationFn: () => api.patch(`/quotes/${activeQuote.id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotes', event.id] }),
  });

  if (!quotes) return <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />;

  if (!activeQuote) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 mb-4">No quote created yet.</p>
        <button
          className="btn-primary"
          onClick={() => createQuote.mutate()}
          disabled={createQuote.isPending}
        >
          {createQuote.isPending ? 'Creating…' : 'Create Quote v1'}
        </button>
      </div>
    );
  }

  const inclusions = activeQuote.items?.filter((i: any) => !i.isAddon) ?? [];
  const addons = activeQuote.items?.filter((i: any) => i.isAddon) ?? [];

  return (
    <div className="space-y-5">
      {/* Quote Header */}
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">Quote v{activeQuote.version}</h2>
              {activeQuote.isApproved ? (
                <span className="badge bg-green-100 text-green-700">✓ Approved</span>
              ) : (
                <span className="badge bg-yellow-100 text-yellow-700">Pending Approval</span>
              )}
            </div>
            {activeQuote.packageName && (
              <p className="text-sm text-gray-500 mt-1">{activeQuote.packageName}</p>
            )}
          </div>
          <div className="flex gap-2">
            {!activeQuote.isApproved && (
              <button
                onClick={() => approve.mutate()}
                className="btn-primary text-sm"
                disabled={approve.isPending}
              >
                Approve Quote
              </button>
            )}
            <button
              onClick={() => createQuote.mutate()}
              className="btn-secondary text-sm"
              disabled={createQuote.isPending}
            >
              New Version
            </button>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-sm">Inclusions</h3>
          <button
            onClick={() => { setShowNewItem(true); setItemForm({ ...itemForm, isAddon: false }); }}
            className="text-xs text-slate-700 hover:underline font-medium"
          >
            + Add Line
          </button>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 text-xs text-gray-500">
            <tr>
              <th className="text-left px-5 py-2 font-medium">Item</th>
              <th className="text-right px-4 py-2 font-medium">Qty</th>
              <th className="text-right px-4 py-2 font-medium">Unit Price</th>
              <th className="text-right px-4 py-2 font-medium">Total</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {inclusions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400 text-xs">
                  No line items yet.
                </td>
              </tr>
            ) : (
              inclusions.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="px-5 py-3">
                    <p className="font-medium">{item.itemName}</p>
                    {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                    {item.description && <p className="text-xs text-gray-400 italic">{item.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatPHP(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatPHP(item.totalPrice)}</td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Add-ons section */}
        {addons.length > 0 && (
          <>
            <div className="px-5 py-3 bg-blue-50 border-y border-blue-100">
              <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Add-ons</h4>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {addons.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 group">
                    <td className="px-5 py-3 w-full">
                      <p className="font-medium">{item.itemName}</p>
                      {item.description && <p className="text-xs text-gray-400 italic">{item.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 whitespace-nowrap">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{formatPHP(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatPHP(item.totalPrice)}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Totals */}
        <div className="border-t border-gray-200 px-5 py-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>{formatPHP(activeQuote.subtotal)}</span>
          </div>
          {Number(activeQuote.discountValue) > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({activeQuote.discountType})</span>
              <span>-{formatPHP(activeQuote.discountValue)}</span>
            </div>
          )}
          {Number(activeQuote.taxPercent) > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax ({activeQuote.taxPercent}%)</span>
              <span>{formatPHP((Number(activeQuote.subtotal) - Number(activeQuote.discountValue)) * Number(activeQuote.taxPercent) / 100)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
            <span>Grand Total</span>
            <span>{formatPHP(activeQuote.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      {showNewItem && (
        <div className="card p-5 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium text-sm">Add Line Item</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={itemForm.isAddon}
                onChange={(e) => setItemForm({ ...itemForm, isAddon: e.target.checked })}
                className="accent-slate-800"
              />
              Add-on (not included in package)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input col-span-2"
              placeholder="Item name *"
              value={itemForm.itemName}
              onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
            />
            <input
              className="input"
              placeholder="Category"
              value={itemForm.category}
              onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
            />
            <input
              className="input"
              placeholder="Description"
              value={itemForm.description}
              onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                type="number"
                className="input w-24"
                placeholder="Qty"
                value={itemForm.quantity}
                onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
              />
              <input
                className="input flex-1"
                placeholder="Unit"
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
              />
            </div>
            <input
              type="number"
              className="input"
              placeholder="Unit price (PHP) *"
              value={itemForm.unitPrice}
              onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => addItem.mutate(itemForm)}
              disabled={!itemForm.itemName || !itemForm.unitPrice || addItem.isPending}
            >
              {addItem.isPending ? 'Adding…' : 'Add Item'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowNewItem(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
