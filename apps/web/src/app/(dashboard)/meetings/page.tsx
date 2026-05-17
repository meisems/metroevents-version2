// apps/web/src/app/(dashboard)/meetings/page.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatShortDate } from '@/lib/utils';

export default function MeetingsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [upcoming, setUpcoming] = useState(false);
  const [form, setForm] = useState({
    clientName: '', contactNo: '', meetingDate: '', meetingTime: '',
    location: '', packageAvailed: '', packageNotes: '',
  });

  const { data: meetings } = useQuery({
    queryKey: ['meetings', upcoming],
    queryFn: () => api.get('/meetings', { params: { upcoming: upcoming || undefined } }).then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: (data: any) => api.post('/meetings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meetings'] });
      setShowForm(false);
      setForm({ clientName: '', contactNo: '', meetingDate: '', meetingTime: '', location: '', packageAvailed: '', packageNotes: '' });
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: any) => api.patch(`/meetings/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  });

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const STATUS_COLORS: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    done: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    rescheduled: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ocular / Meetings</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          + Log Meeting
        </button>
      </div>

      <div className="flex gap-2">
        {['All', 'Upcoming'].map((label) => (
          <button
            key={label}
            onClick={() => setUpcoming(label === 'Upcoming')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (label === 'Upcoming') === upcoming
                ? 'bg-slate-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="card p-6 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium">Log a Meeting</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Client Name *</label>
              <input className="input" placeholder="Full name" value={form.clientName} onChange={f('clientName')} />
            </div>
            <div>
              <label className="label">Contact No.</label>
              <input className="input" placeholder="+63 9XX XXX XXXX" value={form.contactNo} onChange={f('contactNo')} />
            </div>
            <div>
              <label className="label">Date *</label>
              <input type="date" className="input" value={form.meetingDate} onChange={f('meetingDate')} />
            </div>
            <div>
              <label className="label">Time *</label>
              <input type="time" className="input" value={form.meetingTime} onChange={f('meetingTime')} />
            </div>
            <div className="col-span-2">
              <label className="label">Location / Venue *</label>
              <input className="input" placeholder="Metro Events Office / Zoom / Client's venue" value={form.location} onChange={f('location')} />
            </div>
            <div>
              <label className="label">Package Availed *</label>
              <input className="input" placeholder="e.g. Grand Debut Package" value={form.packageAvailed} onChange={f('packageAvailed')} />
            </div>
          </div>
          <div>
            <label className="label">Package Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Additional notes about the package discussed…" value={form.packageNotes} onChange={f('packageNotes')} />
          </div>
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => create.mutate({ ...form, meetingTime: `2000-01-01T${form.meetingTime}:00` })}
              disabled={!form.clientName || !form.meetingDate || !form.location || create.isPending}
            >
              {create.isPending ? 'Saving…' : 'Log Meeting'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!meetings?.length ? (
          <div className="text-center py-12 text-gray-400">No meetings logged yet.</div>
        ) : (
          meetings.map((m: any) => (
            <div key={m.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{m.clientName}</p>
                    <span className={`badge ${STATUS_COLORS[m.status] ?? 'bg-gray-100'} capitalize`}>
                      {m.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{m.location}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatShortDate(m.meetingDate)} ·{' '}
                    {new Date(m.meetingTime).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                    {m.contactNo && ` · ${m.contactNo}`}
                  </p>
                  <p className="text-sm text-slate-700 mt-2 font-medium">{m.packageAvailed}</p>
                  {m.packageNotes && <p className="text-xs text-gray-500 mt-0.5">{m.packageNotes}</p>}
                </div>
                {m.status === 'scheduled' && (
                  <div className="flex gap-2 flex-col">
                    <button
                      onClick={() => updateStatus.mutate({ id: m.id, status: 'done' })}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: m.id, status: 'cancelled' })}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
