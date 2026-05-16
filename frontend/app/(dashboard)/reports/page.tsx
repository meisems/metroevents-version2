'use client';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, DollarSign, CalendarDays, Star } from 'lucide-react';
import { peso } from '@/lib/utils';

const COLORS = ['#C9A84C','#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444'];

export default function ReportsPage() {
  const { data: r, isLoading } = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.get().then(res => res.data) });

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  const tooltipStyle = { backgroundColor: '#16213E', border: '1px solid rgba(15,52,96,0.6)', borderRadius: '8px', color: '#F0F0F0' };

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={peso(r?.totalRevenue)} icon={DollarSign} color="gold" />
        <StatCard title="Total Events" value={r?.totalEvents ?? 0} icon={CalendarDays} color="blue" />
        <StatCard title="Avg Rating" value={r?.avgRating ? `${r.avgRating}/5` : '—'} icon={Star} color="purple" />
        <StatCard title="Conversion Rate" value={r?.conversionRate ? `${r.conversionRate}%` : '—'} icon={TrendingUp} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly revenue */}
        {r?.monthlyRevenue && (
          <ChartCard title="Monthly Revenue & Bookings">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={r.monthlyRevenue}>
                <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₱${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => peso(v)} />
                <Bar dataKey="revenue" fill="#C9A84C" radius={[4,4,0,0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Events by type */}
        {r?.eventsByType && (
          <ChartCard title="Events by Type">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={r.eventsByType} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {r.eventsByType.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ color: '#9CA3AF', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* CRM pipeline */}
        {r?.crmFunnel && (
          <ChartCard title="CRM Pipeline Funnel">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={r.crmFunnel} layout="vertical">
                <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stage" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0,4,4,0]} name="Clients" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* Top revenue events */}
        {r?.topEvents && (
          <ChartCard title="Top 5 Revenue Events">
            <div className="space-y-3 pt-2">
              {r.topEvents.map((e: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: COLORS[i] + '30', color: COLORS[i] }}>{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{e.title}</p>
                    <div className="mt-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(e.revenue / r.topEvents[0].revenue) * 100}%`, background: COLORS[i] }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: COLORS[i] }}>{peso(e.revenue)}</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5">
      <h3 className="font-bold text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}
