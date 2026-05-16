'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { meetingsApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Coffee, Plus, Search, Users, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { fmt } from '@/lib/utils';
import { isToday, parseISO } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  no_show: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function MeetingsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ['meetings', search, status],
    queryFn: () => meetingsApi.list({ search: search || undefined, status: status || undefined }).then(r => r.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: any) => meetingsApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); toast.success('Meeting updated'); },
  });

  const todayCount = (meetings as any[]).filter((m: any) => { try { return isToday(parseISO(m.meetingDate)); } catch { return false; } }).length;
  const scheduledCount = (meetings as any[]).filter((m: any) => m.status === 'scheduled').length;
  const completedCount = (meetings as any[]).filter((m: any) => m.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total" value={(meetings as any[]).length} icon={Coffee} color="blue" />
        <StatCard title="Today" value={todayCount} icon={CalendarDays} color="gold" />
        <StatCard title="Scheduled" value={scheduledCount} icon={Users} color="teal" />
        <StatCard title="Completed" value={completedCount} icon={CheckCircle} color="green" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search meetings…"
            className="w-full pl-9 pr-4 py-2 bg-[#16213E] border border-[#0F3460]/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
        </div>
        <Select value={status} onChange={e => setStatus(e.target.value)} className="w-auto">
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s} className="capitalize">{s.replace('_', ' ')}</option>)}
        </Select>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Schedule Meeting</Button>
      </div>

      <div className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-[#0F3460]/40 text-xs text-gray-500 uppercase">
            {['Client','Date & Time','Location','Package','Status','Actions'].map(h => <th key={h} className="px-4 py-2.5 text-left">{h}</th>)}
          </tr></thead>
          <tbody>
            {(meetings as any[]).map((m: any) => {
              const today = (() => { try { return isToday(parseISO(m.meetingDate)); } catch { return false; } })();
              return (
                <tr key={m.id} className={`border-b border-[#0F3460]/20 hover:bg-[#0D1117]/30 ${today ? 'bg-brand-gold/5' : ''}`}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{m.clientName}</p>
                    {m.contactNumber && <p className="text-xs text-gray-500">{m.contactNumber}</p>}
                    {today && <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded-full">Today</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-400">{fmt(m.meetingDate)} {m.meetingTime && <span className="text-xs">· {m.meetingTime}</span>}</td>
                  <td className="px-4 py-3 text-gray-400">{m.location}</td>
                  <td className="px-4 py-3 text-gray-400">{m.packageDiscussed ?? '—'}</td>
                  <td className="px-4 py-3"><Badge label={m.status?.replace('_', ' ')} className={STATUS_COLORS[m.status] ?? ''} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {m.status === 'scheduled' && (
                        <>
                          <button onClick={() => updateMutation.mutate({ id: m.id, data: { status: 'completed' } })} className="p-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition"><CheckCircle className="w-3.5 h-3.5" /></button>
                          <button onClick={() => updateMutation.mutate({ id: m.id, data: { status: 'no_show' } })} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"><XCircle className="w-3.5 h-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!isLoading && meetings.length === 0 && <EmptyState icon={Coffee} title="No meetings found" />}
      </div>

      {showCreate && <CreateMeetingModal onClose={() => setShowCreate(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['meetings'] }); setShowCreate(false); }} />}
    </div>
  );
}

function CreateMeetingModal({ onClose, onCreated }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: { clientName:'', contactNumber:'', meetingDate:'', meetingTime:'', location:'', packageDiscussed:'', notes:'' } });
  const mutation = useMutation({ mutationFn: meetingsApi.create, onSuccess: () => { toast.success('Meeting scheduled!'); onCreated(); } });
  return (
    <Modal title="Schedule Meeting" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Client Name *" placeholder="Maria Santos" {...register('clientName')} /></div>
          <Input label="Contact Number" placeholder="+63 917 000 0000" {...register('contactNumber')} />
          <Input label="Package Discussed" placeholder="Gold Package" {...register('packageDiscussed')} />
          <Input label="Meeting Date" type="date" {...register('meetingDate')} />
          <Input label="Meeting Time" type="time" {...register('meetingTime')} />
          <div className="col-span-2"><Input label="Location" placeholder="Metro Events Office / Zoom" {...register('location')} /></div>
          <div className="col-span-2"><Textarea label="Notes" rows={2} {...register('notes')} /></div>
        </div>
        <div className="flex justify-end gap-2"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button type="submit" loading={mutation.isPending}>Schedule</Button></div>
      </form>
    </Modal>
  );
}
