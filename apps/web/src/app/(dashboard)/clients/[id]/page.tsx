// apps/web/src/app/(dashboard)/clients/[id]/page.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, formatShortDate, PIPELINE_LABELS, EVENT_STATUS_COLORS } from '@/lib/utils';

const STAGE_OPTIONS = Object.entries(PIPELINE_LABELS);

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const qc = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', params.id],
    queryFn: () => api.get(`/clients/${params.id}`).then((r) => r.data),
  });

  const setStage = useMutation({
    mutationFn: (stage: string) => api.patch(`/clients/${params.id}/set-stage`, { stage }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', params.id] }),
  });

  const advance = useMutation({
    mutationFn: () => api.patch(`/clients/${params.id}/advance-stage`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client', params.id] }),
  });

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-gray-200 rounded-xl" /><div className="h-48 bg-gray-200 rounded-xl" /></div>;
  if (!client) return <div className="text-gray-400">Client not found.</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="text-gray-400 hover:text-gray-600 text-sm">← Clients</Link>
      </div>

      {/* Header Card */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{client.fullName}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {client.phone && <span>📞 {client.phone}</span>}
              {client.email && <span>✉️ {client.email}</span>}
              {client.instagram && <span>📸 {client.instagram}</span>}
            </div>
            {client.referredBy && (
              <p className="text-xs text-gray-400 mt-1">via {client.referredBy}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 items-end">
            <select
              className="input text-sm"
              value={client.pipelineStage}
              onChange={(e) => setStage.mutate(e.target.value)}
            >
              {STAGE_OPTIONS.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            {!['done', 'cancelled', 'fully_booked'].includes(client.pipelineStage) && (
              <button
                onClick={() => advance.mutate()}
                disabled={advance.isPending}
                className="btn-primary text-xs"
              >
                Advance Stage →
              </button>
            )}
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-700 whitespace-pre-line">{client.notes}</p>
          </div>
        )}

        <dl className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100 text-sm">
          <div>
            <dt className="text-xs text-gray-400">Inquiry Date</dt>
            <dd className="font-medium">{formatDate(client.inquiryDate)}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Last Contacted</dt>
            <dd className="font-medium">{client.lastContacted ? formatDate(client.lastContacted) : '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400">Total Events</dt>
            <dd className="font-medium">{client.events?.length ?? 0}</dd>
          </div>
        </dl>
      </div>

      {/* Events */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Events</h2>
          <Link href={`/events/new?clientId=${client.id}`} className="btn-primary text-xs">+ Create Event</Link>
        </div>
        {!client.events?.length ? (
          <p className="text-sm text-gray-400">No events yet.</p>
        ) : (
          <div className="space-y-2">
            {client.events.map((event: any) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{event.name}</p>
                  <p className="text-xs text-gray-400">{formatShortDate(event.eventDate)} · {event.venueName ?? 'Venue TBD'}</p>
                </div>
                <span className={`badge ${EVENT_STATUS_COLORS[event.status] ?? 'bg-gray-100'} capitalize`}>
                  {event.status?.replace('_', ' ')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
