// apps/web/src/app/(dashboard)/dashboard/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '@/lib/api';
import { formatPHP } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/reports/dashboard').then((r) => r.data),
  });

  const { data: revenueByMonth } = useQuery({
    queryKey: ['revenue-by-month'],
    queryFn: () => api.get('/reports/revenue-by-month').then((r) => r.data),
  });

  const revenueChartData = revenueByMonth
    ? MONTHS.map((m, i) => ({ month: m, revenue: revenueByMonth[i + 1] ?? 0 }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6 h-28 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Clients', value: stats?.totalClients ?? 0, icon: '👥', color: 'text-blue-600' },
    { label: 'Active Events', value: stats?.activeEvents ?? 0, icon: '📅', color: 'text-purple-600' },
    { label: 'Revenue This Month', value: formatPHP(stats?.monthRevenue ?? 0), icon: '💰', color: 'text-green-600', small: true },
    { label: 'Overdue Payments', value: stats?.overduePayments ?? 0, icon: '⚠️', color: 'text-red-600' },
  ];

  const pipelineData = stats?.pipeline
    ? Object.entries(stats.pipeline).map(([stage, count]) => ({
        stage: stage.replace('_', ' '),
        count,
      }))
    : [];

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back — here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{kpi.icon}</span>
            </div>
            <p className={`${kpi.small ? 'text-xl' : 'text-3xl'} font-bold ${kpi.color}`}>
              {kpi.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Revenue This Year</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₱${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatPHP(v)} />
              <Bar dataKey="revenue" fill="#1e293b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4">CRM Pipeline</h2>
          <div className="space-y-3">
            {pipelineData.map(({ stage, count }: any) => (
              <div key={stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-32 capitalize">{stage}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700 rounded-full"
                    style={{ width: `${Math.min(100, (count / (stats?.totalClients || 1)) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-700 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event type breakdown */}
      {stats?.eventTypes && (
        <div className="card p-6">
          <h2 className="font-semibold mb-4">Events by Type</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.eventTypes).map(([type, count]: any) => (
              <div key={type} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center min-w-[100px]">
                <p className="text-2xl font-bold text-slate-800">{count}</p>
                <p className="text-xs text-gray-500 capitalize mt-1">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
