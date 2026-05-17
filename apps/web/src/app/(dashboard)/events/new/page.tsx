// apps/web/src/app/(dashboard)/events/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';

const EVENT_TYPES = ['wedding', 'corporate', 'birthday', 'debut', 'other'];

export default function NewEventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    eventType: 'wedding',
    clientId: '',
    eventDate: '',
    venueName: '',
    venueAddress: '',
    packageName: '',
    totalBudget: '',
    colorPalette: '',
    coordinatorId: '',
    teamNotes: '',
  });
  const [error, setError] = useState('');

  const { data: clients } = useQuery({
    queryKey: ['clients-select'],
    queryFn: () => api.get('/clients').then((r) => r.data),
  });

  const { data: coordinators } = useQuery({
    queryKey: ['coordinators'],
    queryFn: () => api.get('/users?role=coordinator').then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/events', data),
    onSuccess: (res) => router.push(`/events/${res.data.id}`),
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create event'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.clientId || !form.eventDate) {
      setError('Name, client, and event date are required.');
      return;
    }
    create.mutate({ ...form, totalBudget: form.totalBudget ? +form.totalBudget : 0 });
  };

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/events" className="text-gray-400 hover:text-gray-600 text-sm">← Events</Link>
        <h1 className="text-2xl font-bold">Create New Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-7 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Basics */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
            Basic Information
          </h2>

          <div>
            <label className="label">Event Name *</label>
            <input className="input" placeholder="e.g. Santos Wedding" value={form.name} onChange={f('name')} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Event Type *</label>
              <select className="input" value={form.eventType} onChange={f('eventType')}>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Client *</label>
              <select className="input" value={form.clientId} onChange={f('clientId')} required>
                <option value="">Select client…</option>
                {clients?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Event Date *</label>
              <input type="date" className="input" value={form.eventDate} onChange={f('eventDate')} required />
            </div>
            <div>
              <label className="label">Coordinator</label>
              <select className="input" value={form.coordinatorId} onChange={f('coordinatorId')}>
                <option value="">Unassigned</option>
                {coordinators?.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
            Venue
          </h2>
          <div>
            <label className="label">Venue Name</label>
            <input className="input" placeholder="e.g. Grand Ballroom, Manila Hotel" value={form.venueName} onChange={f('venueName')} />
          </div>
          <div>
            <label className="label">Venue Address</label>
            <input className="input" placeholder="Full address" value={form.venueAddress} onChange={f('venueAddress')} />
          </div>
        </div>

        {/* Package */}
        <div className="space-y-4">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
            Package & Design
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Package Name</label>
              <input className="input" placeholder="e.g. Grand Elegance Package" value={form.packageName} onChange={f('packageName')} />
            </div>
            <div>
              <label className="label">Total Budget (PHP)</label>
              <input type="number" className="input" placeholder="0.00" value={form.totalBudget} onChange={f('totalBudget')} />
            </div>
          </div>
          <div>
            <label className="label">Color Palette</label>
            <input className="input" placeholder="e.g. Dusty rose, ivory, sage green" value={form.colorPalette} onChange={f('colorPalette')} />
          </div>
          <div>
            <label className="label">Team Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Internal notes for the team…" value={form.teamNotes} onChange={f('teamNotes')} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={create.isPending}>
            {create.isPending ? 'Creating…' : 'Create Event'}
          </button>
          <Link href="/events" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
