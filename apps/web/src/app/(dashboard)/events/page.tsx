// apps/web/src/app/(dashboard)/events/page.tsx
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { formatShortDate, EVENT_STATUS_COLORS, daysUntil } from '@/lib/utils';

const STATUS_OPTIONS = ['planning', 'production', 'ready', 'event_day', 'done', 'cancelled'];
const TYPE_OPTIONS = ['wedding', 'corporate', 'birthday', 'debut', 'other'];

export default function EventsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', q, status, type],
    queryFn: () =>
      api.get('/events', {
        params: { q: q || undefined, status: status || undefined, type: type || undefined },
      }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Events</h1>
        <Link href="/events/new" className="btn-primary text-sm">+ New Event</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          className="input max-w-xs"
          placeholder="Search events…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input max-w-[160px]"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>
          ))}
        </select>
        <select
          className="input max-w-[160px]"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">All Types</option>
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t} className="capitalize">{t}</option>
          ))}
        </select>
      </div>

      {/* Event Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-5 h-40 animate-pulse bg-gray-100" />
            ))
          : events?.length === 0
          ? (
            <div className="col-span-3 text-center py-16 text-gray-400">No events found.</div>
          )
          : events?.map((event: any) => {
              const days = daysUntil(event.eventDate);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="card p-5 hover:shadow-md transition-shadow block"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{event.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{event.eventId}</p>
                    </div>
                    <span className={`badge ${EVENT_STATUS_COLORS[event.status] ?? 'bg-gray-100'} capitalize`}>
                      {event.status?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-sm text-gray-600">
                    <p>📅 {formatShortDate(event.eventDate)}
                      {days >= 0 && days <= 30 && (
                        <span className={`ml-2 text-xs font-medium ${days <= 7 ? 'text-red-500' : 'text-amber-500'}`}>
                          {days === 0 ? 'Today!' : `in ${days}d`}
                        </span>
                      )}
                    </p>
                    <p>👤 {event.client?.fullName}</p>
                    {event.venueName && <p>📍 {event.venueName}</p>}
                    <p className="capitalize">🎪 {event.eventType}</p>
                  </div>

                  {event.coordinator && (
                    <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-3">
                      Coordinator: {event.coordinator.name}
                    </p>
                  )}
                </Link>
              );
            })}
      </div>
    </div>
  );
}
