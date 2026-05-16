'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api';
import { EVENT_STATUSES, fmt, peso } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import ChecklistTab from './tabs/ChecklistTab';
import TasksTab from './tabs/TasksTab';
import QuoteTab from './tabs/QuoteTab';
import PaymentsTab from './tabs/PaymentsTab';
import MoodboardTab from './tabs/MoodboardTab';
import InventoryTab from './tabs/InventoryTab';
import SuppliersTab from './tabs/SuppliersTab';
import EventLogTab from './tabs/EventLogTab';
import { CalendarDays, MapPin, Users, DollarSign } from 'lucide-react';

const TABS = ['Overview','Checklist','Tasks','Quote','Payments','Moodboard','Inventory','Suppliers','Event Log'];

export default function EventWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState('Overview');

  const { data: event, isLoading } = useQuery({ queryKey: ['event', id], queryFn: () => eventsApi.get(id).then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!event) return <p className="text-red-400">Event not found.</p>;

  const st = EVENT_STATUSES[event.status] ?? { label: event.status, color: '' };
  const balance = (event.totalAmount ?? 0) - (event.totalPaid ?? 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <Badge label={st.label} className={st.color} />
              <Badge label={event.type} className="bg-brand-gold/10 text-brand-gold border-brand-gold/20 capitalize" />
            </div>
            <div className="flex gap-5 text-sm text-gray-400 flex-wrap">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{fmt(event.eventDate)}</span>
              {event.venue && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.venue}</span>}
              {event.guestCount && <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{event.guestCount} guests</span>}
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div><p className="text-xs text-gray-500 mb-1">Total</p><p className="text-lg font-bold text-white">{peso(event.totalAmount)}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Paid</p><p className="text-lg font-bold text-green-400">{peso(event.totalPaid)}</p></div>
            <div><p className="text-xs text-gray-500 mb-1">Balance</p><p className={`text-lg font-bold ${balance > 0 ? 'text-red-400' : 'text-gray-400'}`}>{peso(balance)}</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto bg-[#16213E] border border-[#0F3460]/50 rounded-xl p-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-brand-gold text-white' : 'text-gray-400 hover:text-white hover:bg-[#0F3460]/30'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {tab === 'Overview' && <OverviewTab event={event} />}
        {tab === 'Checklist' && <ChecklistTab eventId={id} />}
        {tab === 'Tasks' && <TasksTab eventId={id} />}
        {tab === 'Quote' && <QuoteTab eventId={id} />}
        {tab === 'Payments' && <PaymentsTab eventId={id} />}
        {tab === 'Moodboard' && <MoodboardTab eventId={id} />}
        {tab === 'Inventory' && <InventoryTab eventId={id} />}
        {tab === 'Suppliers' && <SuppliersTab eventId={id} />}
        {tab === 'Event Log' && <EventLogTab eventId={id} />}
      </div>
    </div>
  );
}

function OverviewTab({ event }: { event: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5 space-y-3">
        <h3 className="font-bold text-white mb-3">Event Details</h3>
        {[
          ['Client', event.clientName ?? event.clientId],
          ['Event Date', fmt(event.eventDate)],
          ['Venue', event.venue],
          ['Type', event.type],
          ['Guest Count', event.guestCount],
          ['Status', event.status],
          ['Created', fmt(event.createdAt)],
        ].map(([label, value]) => value ? (
          <div key={label as string} className="flex justify-between text-sm">
            <span className="text-gray-400">{label}</span>
            <span className="text-white capitalize">{String(value)}</span>
          </div>
        ) : null)}
      </div>
      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5">
        <h3 className="font-bold text-white mb-4">Financial Summary</h3>
        <div className="space-y-3">
          {[
            ['Grand Total', peso(event.totalAmount), 'text-white'],
            ['Total Paid', peso(event.totalPaid), 'text-green-400'],
            ['Balance Due', peso((event.totalAmount ?? 0) - (event.totalPaid ?? 0)), 'text-red-400'],
          ].map(([label, value, color]) => (
            <div key={label} className="flex justify-between items-center p-3 bg-[#0D1117]/60 rounded-lg">
              <span className="text-sm text-gray-400">{label}</span>
              <span className={`font-bold ${color}`}>{value}</span>
            </div>
          ))}
        </div>
        {event.notes && <div className="mt-4 p-3 bg-[#0D1117]/40 rounded-lg"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-300">{event.notes}</p></div>}
      </div>
    </div>
  );
}
