// apps/web/src/app/(dashboard)/events/[id]/tabs/EventLogTab.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const LOG_TYPES = ['note', 'incident', 'change_request', 'client_approval', 'sign_off', 'timeline_tick'];

const LOG_ICONS: Record<string, string> = {
  note: '📝',
  incident: '⚠️',
  change_request: '🔄',
  client_approval: '✅',
  sign_off: '✍️',
  timeline_tick: '⏰',
};

export default function EventLogTab({ event }: { event: any }) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ logType: 'note', message: '', changeDescription: '' });

  const { data: logs } = useQuery({
    queryKey: ['event-logs', event.id],
    queryFn: () => api.get(`/event-logs/event/${event.id}`).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/event-logs', { ...data, eventId: event.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-logs', event.id] });
      setShowForm(false);
      setForm({ logType: 'note', message: '', changeDescription: '' });
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.patch(`/event-logs/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-logs', event.id] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Event Log</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          + Add Log Entry
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-3 border-2 border-slate-200">
          <select
            className="input"
            value={form.logType}
            onChange={(e) => setForm({ ...form, logType: e.target.value })}
          >
            {LOG_TYPES.map((t) => (
              <option key={t} value={t}>
                {LOG_ICONS[t]} {t.replace('_', ' ')}
              </option>
            ))}
          </select>
          <textarea
            className="input resize-none"
            placeholder="Log message *"
            rows={3}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          {form.logType === 'change_request' && (
            <textarea
              className="input resize-none"
              placeholder="Describe the change requested"
              rows={2}
              value={form.changeDescription}
              onChange={(e) => setForm({ ...form, changeDescription: e.target.value })}
            />
          )}
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => create.mutate(form)}
              disabled={!form.message || create.isPending}
            >
              {create.isPending ? 'Saving…' : 'Add Entry'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!logs?.length ? (
          <div className="text-center py-12 text-gray-400">No log entries yet.</div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="card p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{LOG_ICONS[log.logType] ?? '📝'}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500 capitalize">
                      {log.logType.replace('_', ' ')}
                      {log.logger && ` — ${log.logger.name}`}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(log.loggedAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{log.message}</p>
                  {log.changeDescription && (
                    <p className="text-xs text-blue-700 mt-2 bg-blue-50 px-3 py-2 rounded">
                      Change: {log.changeDescription}
                    </p>
                  )}
                  {log.logType === 'change_request' && !log.isApprovedByClient && (
                    <button
                      onClick={() => approve.mutate(log.id)}
                      className="mt-2 text-xs text-green-600 hover:underline font-medium"
                    >
                      Mark as Client-Approved
                    </button>
                  )}
                  {log.isApprovedByClient && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Approved by {log.approvedByName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
