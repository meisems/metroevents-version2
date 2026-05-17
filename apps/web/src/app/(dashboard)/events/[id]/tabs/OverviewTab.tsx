// apps/web/src/app/(dashboard)/events/[id]/tabs/OverviewTab.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatDate, formatPHP } from '@/lib/utils';

export default function OverviewTab({ event }: { event: any }) {
  const { data: financial } = useQuery({
    queryKey: ['event-financial', event.id],
    queryFn: () => api.get(`/events/${event.id}/financial-summary`).then((r) => r.data),
  });

  const { data: progress } = useQuery({
    queryKey: ['checklist-progress', event.id],
    queryFn: () => api.get(`/checklist/event/${event.id}/progress`).then((r) => r.data),
  });

  const details = [
    { label: 'Client', value: event.client?.fullName },
    { label: 'Event Date', value: formatDate(event.eventDate) },
    { label: 'Venue', value: event.venueName ?? '—' },
    { label: 'Venue Address', value: event.venueAddress ?? '—' },
    { label: 'Call Time', value: event.callTime ? formatDate(event.callTime) : '—' },
    { label: 'Setup Deadline', value: event.setupDeadline ? formatDate(event.setupDeadline) : '—' },
    { label: 'Package', value: event.packageName ?? '—' },
    { label: 'Color Palette', value: event.colorPalette ?? '—' },
    { label: 'Coordinator', value: event.coordinator?.name ?? '—' },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Event Details */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Event Details</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {details.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900 mt-0.5">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {event.teamNotes && (
          <div className="card p-6">
            <h2 className="font-semibold mb-2">Team Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-line">{event.teamNotes}</p>
          </div>
        )}

        {event.internalNotes && (
          <div className="card p-6 border-amber-200 bg-amber-50">
            <h2 className="font-semibold mb-2 text-amber-800">Internal Notes</h2>
            <p className="text-sm text-amber-900 whitespace-pre-line">{event.internalNotes}</p>
          </div>
        )}
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-4">
        {/* Financial Summary */}
        {financial && (
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">Financials</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Grand Total</span>
                <span className="font-semibold">{formatPHP(financial.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-semibold text-green-600">{formatPHP(financial.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                <span className="text-gray-500">Balance Due</span>
                <span className={`font-bold ${financial.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatPHP(financial.balanceDue)}
                </span>
              </div>
              {financial.grandTotal > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Payment progress</span>
                    <span>{Math.round((financial.totalPaid / financial.grandTotal) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${Math.min(100, (financial.totalPaid / financial.grandTotal) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checklist Progress */}
        {progress && (
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Checklist</h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-slate-800">{progress.percent}%</p>
              <p className="text-xs text-gray-500 mt-1">{progress.done} of {progress.total} tasks done</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Counts */}
        <div className="card p-5">
          <h3 className="font-semibold text-sm mb-3">Activity</h3>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            {[
              { label: 'Tasks', count: event.tasks?.length ?? 0 },
              { label: 'Files', count: event.files?.length ?? 0 },
              { label: 'Logs', count: event.eventLogs?.length ?? 0 },
            ].map(({ label, count }) => (
              <div key={label} className="bg-gray-50 rounded-lg py-3">
                <p className="text-xl font-bold text-slate-700">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
