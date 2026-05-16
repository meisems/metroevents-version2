'use client';
import { useQuery } from '@tanstack/react-query';
import { eventsApi, clientsApi, paymentsApi, remindersApi } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { EVENT_STATUSES, CRM_STAGES, peso, fmt } from '@/lib/utils';
import { CalendarDays, Users, DollarSign, Bell, AlertTriangle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: events } = useQuery({ queryKey: ['events'], queryFn: () => eventsApi.list().then(r => r.data) });
  const { data: clients } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list().then(r => r.data) });
  const { data: reminders } = useQuery({ queryKey: ['reminders'], queryFn: () => remindersApi.get().then(r => r.data) });

  const activeEvents = (events ?? []).filter((e: any) => !['done','cancelled'].includes(e.status));
  const totalRevenue = (events ?? []).reduce((s: number, e: any) => s + (e.totalPaid ?? 0), 0);
  const overdueCount = reminders?.overduePayments?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Events" value={activeEvents.length} subtitle="In progress" icon={CalendarDays} color="blue" />
        <StatCard title="Total Clients" value={(clients ?? []).length} subtitle="In CRM" icon={Users} color="gold" />
        <StatCard title="Revenue Collected" value={peso(totalRevenue)} subtitle="All time" icon={DollarSign} color="green" />
        <StatCard title="Overdue Payments" value={overdueCount} subtitle={overdueCount > 0 ? 'Needs attention' : 'All clear'} icon={AlertTriangle} color={overdueCount > 0 ? 'red' : 'teal'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">Upcoming Events</h2>
            <Link href="/events" className="text-xs text-brand-gold hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {activeEvents.slice(0, 5).map((e: any) => {
              const st = EVENT_STATUSES[e.status] ?? { label: e.status, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
              return (
                <Link key={e.id} href={`/events/${e.id}`} className="flex items-center justify-between p-3 bg-[#0D1117]/60 rounded-lg hover:bg-[#0D1117] transition group">
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-brand-gold transition">{e.title}</p>
                    <p className="text-xs text-gray-500">{fmt(e.eventDate)} · {e.venue}</p>
                  </div>
                  <Badge label={st.label} className={st.color} />
                </Link>
              );
            })}
            {activeEvents.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No active events</p>}
          </div>
        </div>

        {/* CRM Pipeline */}
        <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">CRM Pipeline</h2>
            <Link href="/clients" className="text-xs text-brand-gold hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {Object.entries(CRM_STAGES).map(([key, { label, color }]) => {
              const count = (clients ?? []).filter((c: any) => c.stage === key).length;
              return (
                <div key={key} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1117]/40">
                  <Badge label={label} className={color} />
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reminders */}
      {reminders && (reminders.overduePayments?.length > 0 || reminders.upcomingEvents?.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
          <h2 className="font-bold text-amber-300 flex items-center gap-2 mb-4"><Bell className="w-4 h-4" /> Smart Reminders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders.overduePayments?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Overdue Payments</p>
                {reminders.overduePayments.slice(0, 3).map((p: any) => (
                  <div key={p.id} className="text-sm text-red-300 py-1">⚠️ {p.eventTitle} — {peso(p.amount)}</div>
                ))}
              </div>
            )}
            {reminders.upcomingEvents?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Events This Week</p>
                {reminders.upcomingEvents.slice(0, 3).map((e: any) => (
                  <div key={e.id} className="text-sm text-green-300 py-1">📅 {e.title} — {fmt(e.eventDate)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
