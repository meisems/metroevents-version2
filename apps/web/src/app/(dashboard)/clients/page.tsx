// apps/web/src/app/(dashboard)/clients/page.tsx
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import { formatDate, PIPELINE_LABELS } from '@/lib/utils';

const STAGES = Object.entries(PIPELINE_LABELS);

const STAGE_COLORS: Record<string, string> = {
  new_inquiry: 'bg-blue-100 text-blue-700',
  ocular_scheduled: 'bg-yellow-100 text-yellow-700',
  proposal_sent: 'bg-orange-100 text-orange-700',
  reserved: 'bg-green-100 text-green-700',
  fully_booked: 'bg-purple-100 text-purple-700',
  done: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
};

export default function ClientsPage() {
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', q, stage],
    queryFn: () =>
      api.get('/clients', { params: { q: q || undefined, stage: stage || undefined } }).then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CRM — Clients</h1>
        <Link href="/clients/new" className="btn-primary text-sm">+ New Client</Link>
      </div>

      {/* Pipeline Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStage('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !stage ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {STAGES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setStage(stage === key ? '' : key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              stage === key ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        className="input max-w-sm"
        placeholder="Search by name…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Client</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Stage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Inquiry Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Events</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : clients?.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400">No clients found.</td>
              </tr>
            ) : (
              clients?.map((client: any) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/clients/${client.id}`} className="font-medium text-slate-800 hover:text-slate-600">
                      {client.fullName}
                    </Link>
                    {client.referredBy && (
                      <p className="text-xs text-gray-400">via {client.referredBy}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{client.phone ?? '—'}</div>
                    <div className="text-xs text-gray-400">{client.email ?? ''}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STAGE_COLORS[client.pipelineStage] ?? ''}`}>
                      {PIPELINE_LABELS[client.pipelineStage] ?? client.pipelineStage}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(client.inquiryDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{client._count?.events ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
