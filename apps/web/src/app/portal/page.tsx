// apps/web/src/app/portal/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPHP, EVENT_STATUS_COLORS } from '@/lib/utils';

export default function PortalPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/portal/login');
  }, [user, router]);

  const { data: events } = useQuery({
    queryKey: ['portal-events'],
    queryFn: () => api.get('/events').then((r) => r.data),
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}! 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's a summary of your events with Metro Events.</p>
        </div>
        <button onClick={logout} className="btn-secondary text-sm">Sign Out</button>
      </div>

      {!events?.length ? (
        <div className="card p-12 text-center">
          <p className="text-4xl mb-4">🌸</p>
          <h2 className="text-xl font-semibold mb-2">No events yet</h2>
          <p className="text-gray-500 text-sm">
            Your events will appear here once your coordinator sets them up.
            Please reach out to us to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event: any) => (
            <Link
              key={event.id}
              href={`/portal/events/${event.id}`}
              className="card p-6 block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold">{event.name}</h2>
                  <p className="text-sm text-gray-500">{event.eventId}</p>
                </div>
                <span className={`badge ${EVENT_STATUS_COLORS[event.status] ?? 'bg-gray-100'} capitalize`}>
                  {event.status?.replace('_', ' ')}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs">Event Date</dt>
                  <dd className="font-medium">{formatDate(event.eventDate)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Venue</dt>
                  <dd className="font-medium">{event.venueName ?? '—'}</dd>
                </div>
                {event.coordinator && (
                  <div>
                    <dt className="text-gray-500 text-xs">Your Coordinator</dt>
                    <dd className="font-medium">{event.coordinator.name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-gray-500 text-xs">Color Palette</dt>
                  <dd className="font-medium">{event.colorPalette ?? '—'}</dd>
                </div>
              </dl>

              <p className="text-xs text-slate-500 mt-4 font-medium">View details →</p>
            </Link>
          ))}
        </div>
      )}

      <div className="card p-6 bg-amber-50 border-amber-200">
        <h3 className="font-semibold mb-2">Need to reach us?</h3>
        <p className="text-sm text-gray-700">
          For urgent concerns, please contact your coordinator directly or reach us at{' '}
          <a href="mailto:events@metroevents.ph" className="text-amber-700 font-medium hover:underline">
            events@metroevents.ph
          </a>
        </p>
      </div>
    </div>
  );
}
