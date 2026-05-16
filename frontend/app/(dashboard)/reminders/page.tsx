'use client';
import { useQuery } from '@tanstack/react-query';
import { remindersApi } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Bell, AlertTriangle, CalendarDays, Truck, Clock, Users } from 'lucide-react';
import { peso, fmt } from '@/lib/utils';
import Link from 'next/link';

export default function RemindersPage() {
  const { data: r, isLoading } = useQuery({ queryKey: ['reminders'], queryFn: () => remindersApi.get().then(res => res.data) });

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Events This Week" value={r?.upcomingEvents?.length ?? 0} icon={CalendarDays} color="blue" />
        <StatCard title="Overdue Payments" value={r?.overduePayments?.length ?? 0} icon={AlertTriangle} color="red" />
        <StatCard title="Due in 3 Days" value={r?.dueSoon?.length ?? 0} icon={Clock} color="gold" />
        <StatCard title="Stale Clients" value={r?.staleClients?.length ?? 0} icon={Users} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Section title="📅 Events This Week" color="blue">
          {r?.upcomingEvents?.length ? r.upcomingEvents.map((e: any) => (
            <Link key={e.id} href={`/events/${e.id}`} className="flex items-center justify-between p-3 hover:bg-[#0D1117]/40 rounded-lg transition">
              <div><p className="text-sm font-medium text-white">{e.title}</p><p className="text-xs text-gray-500">{e.venue}</p></div>
              <div className="text-right"><p className="text-sm font-bold text-blue-400">{e.daysAway === 0 ? 'Today!' : `${e.daysAway}d away`}</p><p className="text-xs text-gray-500">{fmt(e.eventDate)}</p></div>
            </Link>
          )) : <p className="text-gray-500 text-sm py-3">No upcoming events this week.</p>}
        </Section>

        {/* Overdue Payments */}
        <Section title="⚠️ Overdue Payments" color="red">
          {r?.overduePayments?.length ? r.overduePayments.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3">
              <div><p className="text-sm font-medium text-white">{p.eventTitle}</p><p className="text-xs text-gray-500">{p.daysOverdue}d overdue</p></div>
              <span className="text-red-400 font-bold">{peso(p.amount)}</span>
            </div>
          )) : <p className="text-gray-500 text-sm py-3">No overdue payments. 🎉</p>}
        </Section>

        {/* Due Soon */}
        <Section title="⏰ Payments Due in 3 Days" color="gold">
          {r?.dueSoon?.length ? r.dueSoon.map((p: any) => (
            <div key={p.id} className="flex items-center justify-between p-3">
              <div><p className="text-sm font-medium text-white">{p.eventTitle}</p><p className="text-xs text-gray-500">Due {fmt(p.dueDate)}</p></div>
              <span className="text-brand-gold font-bold">{peso(p.amount)}</span>
            </div>
          )) : <p className="text-gray-500 text-sm py-3">No payments due soon.</p>}
        </Section>

        {/* Stale Clients */}
        <Section title="💤 Stale Clients (7+ days no contact)" color="purple">
          {r?.staleClients?.length ? r.staleClients.map((c: any) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="flex items-center justify-between p-3 hover:bg-[#0D1117]/40 rounded-lg transition">
              <div><p className="text-sm font-medium text-white">{c.name}</p><p className="text-xs text-gray-500">Proposal Sent stage</p></div>
              <span className="text-purple-400 text-xs">{c.daysSinceContact}d ago</span>
            </Link>
          )) : <p className="text-gray-500 text-sm py-3">No stale clients. Great job! 🙌</p>}
        </Section>

        {/* Supplier Deliveries */}
        {r?.supplierDeliveries?.length > 0 && (
          <Section title="🚚 Supplier Deliveries Today/Tomorrow" color="teal">
            {r.supplierDeliveries.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3">
                <div><p className="text-sm font-medium text-white">{s.supplierName}</p><p className="text-xs text-gray-500">{s.description}</p></div>
                <span className="text-teal-400 text-xs">{s.deliveryTime}</span>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const borders: Record<string, string> = { blue:'border-blue-500/20', red:'border-red-500/20', gold:'border-brand-gold/20', purple:'border-purple-500/20', teal:'border-teal-500/20' };
  return (
    <div className={`bg-[#16213E] rounded-xl border ${borders[color] ?? 'border-[#0F3460]/50'} overflow-hidden`}>
      <div className="px-4 py-3 border-b border-[#0F3460]/40"><h2 className="font-bold text-white text-sm">{title}</h2></div>
      <div className="divide-y divide-[#0F3460]/20">{children}</div>
    </div>
  );
}
