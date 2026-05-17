// apps/web/src/app/(dashboard)/events/[id]/tabs/ChecklistTab.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const PHASES = [
  { key: 'pre_production', label: '📋 Pre-Production' },
  { key: 'fabrication', label: '🔨 Fabrication' },
  { key: 'supplier', label: '🤝 Supplier Coordination' },
  { key: 'load_in', label: '🚛 Load-In / Setup' },
  { key: 'event_day', label: '🎉 Event Day' },
  { key: 'load_out', label: '📦 Load-Out' },
  { key: 'post_event', label: '✅ Post-Event' },
];

export default function ChecklistTab({ event }: { event: any }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ title: '', phase: 'pre_production', responsibleRole: '' });
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const { data: items } = useQuery({
    queryKey: ['checklist', event.id],
    queryFn: () => api.get(`/checklist/event/${event.id}`).then((r) => r.data),
  });

  const { data: progress } = useQuery({
    queryKey: ['checklist-progress', event.id],
    queryFn: () => api.get(`/checklist/event/${event.id}/progress`).then((r) => r.data),
  });

  const toggle = useMutation({
    mutationFn: (id: string) => api.patch(`/checklist/${id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', event.id] });
      qc.invalidateQueries({ queryKey: ['checklist-progress', event.id] });
    },
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/checklist', { ...data, eventId: event.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', event.id] });
      setShowAdd(false);
      setNewItem({ title: '', phase: 'pre_production', responsibleRole: '' });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/checklist/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', event.id] });
      qc.invalidateQueries({ queryKey: ['checklist-progress', event.id] });
    },
  });

  const applyTemplate = useMutation({
    mutationFn: (template: string) =>
      api.post(`/checklist/event/${event.id}/apply-template`, { template }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['checklist', event.id] });
      qc.invalidateQueries({ queryKey: ['checklist-progress', event.id] });
      setApplyingTemplate(false);
    },
  });

  const byPhase = (phase: string) => items?.filter((i: any) => i.phase === phase) ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold">Production Checklist</h2>
          {progress && (
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">{progress.percent}%</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setApplyingTemplate(true)}
            className="btn-secondary text-xs"
          >
            Apply Template
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="btn-primary text-sm">
            + Add Item
          </button>
        </div>
      </div>

      {/* Template Modal */}
      {applyingTemplate && (
        <div className="card p-5 border-2 border-amber-200 bg-amber-50 space-y-3">
          <p className="text-sm font-medium text-amber-800">
            ⚠️ Applying a template will replace all existing checklist items.
          </p>
          <div className="flex gap-2 flex-wrap">
            {['wedding', 'corporate', 'birthday'].map((t) => (
              <button
                key={t}
                onClick={() => applyTemplate.mutate(t)}
                disabled={applyTemplate.isPending}
                className="btn-primary text-sm capitalize"
              >
                {t} Template
              </button>
            ))}
            <button onClick={() => setApplyingTemplate(false)} className="btn-secondary text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAdd && (
        <div className="card p-4 space-y-3 border-2 border-slate-200">
          <h3 className="text-sm font-medium">New Checklist Item</h3>
          <input
            className="input"
            placeholder="Item title *"
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={newItem.phase}
              onChange={(e) => setNewItem({ ...newItem, phase: e.target.value })}
            >
              {PHASES.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
            <select
              className="input"
              value={newItem.responsibleRole}
              onChange={(e) => setNewItem({ ...newItem, responsibleRole: e.target.value })}
            >
              <option value="">No assigned role</option>
              <option value="coordinator">Coordinator</option>
              <option value="designer">Designer</option>
              <option value="warehouse">Warehouse</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => create.mutate(newItem)}
              disabled={!newItem.title || create.isPending}
            >
              {create.isPending ? 'Saving…' : 'Save'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowAdd(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Phases */}
      {PHASES.map(({ key, label }) => {
        const phaseItems = byPhase(key);
        if (!phaseItems.length && !showAdd) return null;
        const phaseDone = phaseItems.filter((i: any) => i.isDone).length;

        return (
          <details key={key} open className="card overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 font-medium text-sm">
              <span>{label}</span>
              <span className="text-xs text-gray-500 font-normal">
                {phaseDone}/{phaseItems.length}
              </span>
            </summary>
            <div className="divide-y divide-gray-100">
              {phaseItems.map((item: any) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-5 py-3 group transition-colors ${
                    item.isDone ? 'bg-green-50/50' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.isDone}
                    onChange={() => toggle.mutate(item.id)}
                    className="w-4 h-4 rounded cursor-pointer accent-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {item.title}
                    </p>
                    {item.isDone && item.doneByName && (
                      <p className="text-xs text-gray-400 mt-0.5">Done by {item.doneByName}</p>
                    )}
                  </div>
                  {item.responsibleRole && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
                      {item.responsibleRole}
                    </span>
                  )}
                  <button
                    onClick={() => remove.mutate(item.id)}
                    className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {phaseItems.length === 0 && (
                <p className="px-5 py-3 text-sm text-gray-400">No items in this phase.</p>
              )}
            </div>
          </details>
        );
      })}

      {!items?.length && !showAdd && (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-3">No checklist items yet.</p>
          <button onClick={() => setApplyingTemplate(true)} className="btn-primary text-sm">
            Apply a Template
          </button>
        </div>
      )}
    </div>
  );
}
