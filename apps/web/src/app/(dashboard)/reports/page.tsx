// apps/web/src/app/(dashboard)/reports/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '@/lib/api';
import { formatPHP } from '@/lib/utils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ReportsPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data),
  });

  const { data: revenueByMonth } = useQuery({
    queryKey: ['revenue-by-month'],
    queryFn: () => api.get('/reports/revenue-by-month').then((r) => r.data),
  });

  const { data: eventsByMonth } = useQuery({
    queryKey: ['events-by-month'],
    queryFn: () => api.get('/reports/events-by-month').then((r) => r.data),
  });

  const { data: topClients } = useQuery({
    queryKey: ['top-clients'],
    queryFn: () => api.get('/reports/top-clients').then((r) => r.data),
  });

  const { data: staleLeads } = useQuery({
    queryKey: ['stale-leads'],
    queryFn: () => api.get('/reports/stale-leads').then((r) => r.data),
  });

  const combinedData = MONTHS.map((m, i) => ({
    month: m,
    revenue: revenueByMonth?.[i + 1] ?? 0,
    events: eventsByMonth?.[i + 1] ?? 0,
  }));

  return (
    <div className="space-y-7">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Year Revenue', value: formatPHP(stats.yearRevenue), icon: '💰' },
            { label: 'Total Events', value: stats.totalEvents, icon: '📅' },
            { label: 'Total Clients', value: stats.totalClients, icon: '👥' },
            { label: 'Avg Rating', value: stats.avgRatings?._avg?.ratingOverall?.toFixed(1) ?? 'N/A', icon: '⭐' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card p-5 text-center">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue + Events Chart */}
      <div className="card p-6">
        <h2 className="font-semibold mb-5">Revenue & Events by Month</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={combinedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="revenue" tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
            <YAxis yAxisId="events" orientation="right" tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number, name: string) => name === 'revenue' ? formatPHP(v) : v} />
            <Legend />
            <Bar yAxisId="revenue" dataKey="revenue" fill="#1e293b" radius={[4,4,0,0]} name="Revenue (PHP)" />
            <Bar yAxisId="events" dataKey="events" fill="#f59e0b" radius={[4,4,0,0]} name="Events" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Top Clients by Revenue</h2>
          <div className="space-y-3">
            {topClients?.slice(0, 8).map((c: any, i: number) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.fullName}</p>
                  <p className="text-xs text-gray-400">{c.eventCount} events</p>
                </div>
                <span className="text-sm font-semibold text-green-700 whitespace-nowrap">
                  {formatPHP(c.totalPaid)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stale Leads */}
        <div className="card p-6">
          <h2 className="font-semibold mb-1">Stale Leads</h2>
          <p className="text-xs text-gray-400 mb-4">No contact in 14+ days</p>
          {!staleLeads?.length ? (
            <p className="text-sm text-gray-400">No stale leads 🎉</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {staleLeads.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{c.fullName}</p>
                    <p className="text-xs text-gray-500 capitalize">
                      {c.pipelineStage.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    {c.lastContacted ? (
                      <p className="text-xs text-red-600">
                        Last: {new Date(c.lastContacted).toLocaleDateString('en-PH')}
                      </p>
                    ) : (
                      <p className="text-xs text-red-600">Never contacted</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event type distribution */}
      {stats?.eventTypes && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Events by Type</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.eventTypes).map(([type, count]: any) => (
              <div key={type} className="text-center min-w-[100px] bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-3xl font-bold text-slate-700">{count}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
