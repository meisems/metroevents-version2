// apps/web/src/app/(dashboard)/events/[id]/page.tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatShortDate, EVENT_STATUS_COLORS } from '@/lib/utils';
import OverviewTab from './tabs/OverviewTab';
import QuoteTab from './tabs/QuoteTab';
import ChecklistTab from './tabs/ChecklistTab';
import TasksTab from './tabs/TasksTab';
import PaymentsTab from './tabs/PaymentsTab';
import EventLogTab from './tabs/EventLogTab';
import MoodboardTab from './tabs/MoodboardTab';
import FilesTab from './tabs/FilesTab';

const TABS = [
  { id: 'overview', icon: '📋', label: 'Overview' },
  { id: 'moodboard', icon: '🎨', label: 'Moodboard' },
  { id: 'quote', icon: '💰', label: 'Quote' },
  { id: 'checklist', icon: '✅', label: 'Checklist' },
  { id: 'tasks', icon: '📌', label: 'Tasks' },
  { id: 'payments', icon: '💸', label: 'Payments' },
  { id: 'event-log', icon: '📝', label: 'Event Log' },
  { id: 'files', icon: '📁', label: 'Files' },
];

export default function EventWorkspacePage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('overview');
  const qc = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', params.id],
    queryFn: () => api.get(`/events/${params.id}`).then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/events/${params.id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event', params.id] }),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-xl" />
        <div className="h-10 bg-gray-200 rounded-lg w-3/4" />
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!event) return <div className="text-gray-400">Event not found.</div>;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview': return <OverviewTab event={event} />;
      case 'moodboard': return <MoodboardTab event={event} />;
      case 'quote': return <QuoteTab event={event} />;
      case 'checklist': return <ChecklistTab event={event} />;
      case 'tasks': return <TasksTab event={event} />;
      case 'payments': return <PaymentsTab event={event} />;
      case 'event-log': return <EventLogTab event={event} />;
      case 'files': return <FilesTab event={event} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-0">
      {/* Workspace Header */}
      <div className="bg-slate-900 text-white p-7 -mx-7 -mt-7 mb-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/events" className="text-slate-400 hover:text-white text-sm">Events</Link>
              <span className="text-slate-600">/</span>
              <span className="text-slate-300 text-sm">{event.eventId}</span>
            </div>
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p className="text-slate-400 text-sm mt-1">
              {event.client?.fullName} · {event.eventType} · {formatShortDate(event.eventDate)}
              {event.venueName && ` · ${event.venueName}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm"
              value={event.status}
              onChange={(e) => statusMutation.mutate(e.target.value)}
            >
              {['planning', 'production', 'ready', 'event_day', 'done', 'cancelled'].map((s) => (
                <option key={s} value={s} className="text-gray-900 bg-white capitalize">
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <Link
              href={`/events/${params.id}/edit`}
              className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm hover:bg-white/20 transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 -mx-7 px-7">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="pt-6">{renderTab()}</div>
    </div>
  );
}
