// apps/web/src/app/(dashboard)/reminders/page.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatShortDate, formatPHP } from '@/lib/utils';

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<'overdue' | 'upcoming' | 'stale' | 'composer'>('overdue');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [composedMessage, setComposedMessage] = useState('');

  const { data: reminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders').then((r) => r.data),
  });

  const { data: templates } = useQuery({
    queryKey: ['reminder-templates'],
    queryFn: () => api.get('/reminders/templates').then((r) => r.data),
  });

  const render = useMutation({
    mutationFn: ({ key, vars }: any) => api.post('/reminders/templates/render', { key, vars }),
    onSuccess: (res) => setComposedMessage(res.data.message),
  });

  const tabs = [
    { id: 'overdue', label: `💸 Overdue (${reminders?.overduePayments?.length ?? 0})` },
    { id: 'upcoming', label: `📅 Upcoming Events (${reminders?.upcomingEvents?.length ?? 0})` },
    { id: 'stale', label: `🕐 Stale Leads (${reminders?.staleLeads?.length ?? 0})` },
    { id: 'composer', label: '✍️ Message Composer' },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reminders & Follow-ups</h1>

      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
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

      {/* Overdue Payments */}
      {activeTab === 'overdue' && (
        <div className="space-y-3">
          {!reminders?.overduePayments?.length ? (
            <div className="text-center py-12 text-gray-400">No overdue payments 🎉</div>
          ) : (
            reminders.overduePayments.map((p: any) => (
              <div key={p.id} className="card p-5 border-l-4 border-red-400">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-red-700">{p.event?.client?.fullName}</p>
                    <p className="text-sm text-gray-600">{p.event?.name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Due: {formatShortDate(p.dueDate)} · {p.event?.client?.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{formatPHP(p.amount)}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.paymentType.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      setSelectedTemplate('balance_overdue');
                      setActiveTab('composer');
                      render.mutate({
                        key: 'balance_overdue',
                        vars: {
                          client_name: p.event?.client?.fullName,
                          amount: formatPHP(p.amount),
                          event_name: p.event?.name,
                        },
                      });
                    }}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Compose reminder →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upcoming Events */}
      {activeTab === 'upcoming' && (
        <div className="space-y-3">
          {!reminders?.upcomingEvents?.length ? (
            <div className="text-center py-12 text-gray-400">No events in the next 3 days.</div>
          ) : (
            reminders.upcomingEvents.map((e: any) => (
              <div key={e.id} className="card p-5 border-l-4 border-blue-400">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{e.name}</p>
                    <p className="text-sm text-gray-600">{e.client?.fullName} · {e.client?.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatShortDate(e.eventDate)} · {e.venueName}
                    </p>
                  </div>
                  <span className="badge bg-blue-100 text-blue-700 capitalize">{e.status.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('composer');
                    render.mutate({
                      key: 'event_day',
                      vars: {
                        client_name: e.client?.fullName,
                        event_name: e.name,
                        call_time: e.callTime ? new Date(e.callTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }) : 'TBD',
                      },
                    });
                  }}
                  className="text-xs text-blue-600 hover:underline mt-3 block"
                >
                  Compose day-of message →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Stale Leads */}
      {activeTab === 'stale' && (
        <div className="space-y-3">
          {!reminders?.staleLeads?.length ? (
            <div className="text-center py-12 text-gray-400">No stale leads 🎉</div>
          ) : (
            reminders.staleLeads.map((c: any) => (
              <div key={c.id} className="card p-5 border-l-4 border-yellow-400">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{c.fullName}</p>
                    <p className="text-sm text-gray-600 capitalize">{c.pipelineStage.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Last contact: {c.lastContacted ? formatShortDate(c.lastContacted) : 'Never'}
                      {c.phone && ` · ${c.phone}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('composer');
                    render.mutate({
                      key: 'stale_lead',
                      vars: { client_name: c.fullName },
                    });
                  }}
                  className="text-xs text-blue-600 hover:underline mt-3 block"
                >
                  Compose follow-up →
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Message Composer */}
      {activeTab === 'composer' && (
        <div className="space-y-5 max-w-2xl">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold">Taglish Message Composer</h2>
            <div>
              <label className="label">Template</label>
              <select
                className="input"
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    render.mutate({ key: e.target.value, vars: {} });
                  }
                }}
              >
                <option value="">Choose a template…</option>
                {templates?.map((t: any) => (
                  <option key={t.key} value={t.key}>
                    {t.key.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {composedMessage && (
              <div>
                <label className="label">Composed Message</label>
                <textarea
                  className="input resize-none text-sm leading-relaxed"
                  rows={6}
                  value={composedMessage}
                  onChange={(e) => setComposedMessage(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(composedMessage)}
                    className="btn-secondary text-xs"
                  >
                    📋 Copy to Clipboard
                  </button>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(composedMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs"
                  >
                    📱 Open in WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Template Preview */}
          {templates && (
            <div className="card p-6">
              <h3 className="font-semibold text-sm mb-4">All Templates</h3>
              <div className="space-y-3">
                {templates.map((t: any) => (
                  <details key={t.key} className="border border-gray-200 rounded-lg overflow-hidden">
                    <summary className="px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-50 capitalize">
                      {t.key.replace(/_/g, ' ')}
                    </summary>
                    <div className="px-4 py-3 bg-gray-50 text-sm text-gray-700 border-t border-gray-200">
                      <p className="font-mono text-xs whitespace-pre-line">{t.template}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        Variables: {t.variables.join(', ')}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
