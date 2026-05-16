'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { eventsApi, clientsApi } from '@/lib/api';
import { EVENT_STATUSES, fmt, peso } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';

const EVENT_TYPES = ['wedding','debut','birthday','corporate','christening','graduation','other'];

export default function EventsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', search, status],
    queryFn: () => eventsApi.list({ search: search || undefined, status: status || undefined }).then(r => r.data),
  });

  return (
    <div className="space-y-6">
      {/* Status filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', ...Object.keys(EVENT_STATUSES)].map(s => {
          const st = s ? EVENT_STATUSES[s] : { label: 'All', color: '' };
          return (
            <button key={s} onClick={() => setStatus(s)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${status === s ? (s ? st.color : 'bg-brand-gold/20 text-brand-gold border-brand-gold/30') : 'bg-[#16213E] border-[#0F3460]/50 text-gray-400 hover:text-white'}`}>
              {st?.label ?? s}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2 bg-[#16213E] border border-[#0F3460]/50 rounded-lg text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-gold/40" />
        </div>
        <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> New Event</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {isLoading ? [...Array(6)].map((_,i) => <div key={i} className="h-44 bg-[#16213E] rounded-xl animate-pulse border border-[#0F3460]/30" />) :
          (events as any[]).map((e: any) => {
            const st = EVENT_STATUSES[e.status] ?? { label: e.status, color: '' };
            const balance = (e.totalAmount ?? 0) - (e.totalPaid ?? 0);
            return (
              <Link key={e.id} href={`/events/${e.id}`} className="bg-[#16213E] rounded-xl border border-[#0F3460]/50 p-5 hover:border-brand-gold/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-white truncate group-hover:text-brand-gold transition">{e.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{e.type}</p>
                  </div>
                  <Badge label={st.label} className={st.color} />
                </div>
                <p className="text-sm text-gray-400 mb-1">📅 {fmt(e.eventDate)}</p>
                <p className="text-sm text-gray-400 mb-3">📍 {e.venue || '—'}</p>
                <div className="flex gap-4 pt-3 border-t border-[#0F3460]/30 text-xs text-gray-500">
                  <div><span className="text-white font-semibold">{peso(e.totalPaid)}</span> paid</div>
                  {balance > 0 && <div><span className="text-red-400 font-semibold">{peso(balance)}</span> balance</div>}
                  {e.guestCount && <div><span className="text-white font-semibold">{e.guestCount}</span> guests</div>}
                </div>
              </Link>
            );
          })
        }
      </div>
      {!isLoading && events.length === 0 && <EmptyState icon={CalendarDays} title="No events found" />}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onCreated={() => { qc.invalidateQueries({ queryKey: ['events'] }); setShowCreate(false); }} />}
    </div>
  );
}

function CreateEventModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { data: clients = [] } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list().then(r => r.data) });
  const { register, handleSubmit } = useForm({ defaultValues: { title:'', clientId:'', eventDate:'', venue:'', type:'wedding', guestCount:'', notes:'' } });
  const mutation = useMutation({ mutationFn: eventsApi.create, onSuccess: () => { toast.success('Event created!'); onCreated(); }, onError: () => toast.error('Failed to create event') });
  return (
    <Modal title="New Event" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Input label="Event Title *" placeholder="Santos Wedding" {...register('title')} /></div>
          <Select label="Client" {...register('clientId')}>
            <option value="">— Select client —</option>
            {(clients as any[]).map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Event Type" {...register('type')}>
            {EVENT_TYPES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
          </Select>
          <Input label="Event Date" type="date" {...register('eventDate')} />
          <Input label="Guest Count" type="number" placeholder="150" {...register('guestCount')} />
          <div className="col-span-2"><Input label="Venue" placeholder="Grand Ballroom, Manila Hotel" {...register('venue')} /></div>
          <div className="col-span-2"><Textarea label="Notes" rows={2} {...register('notes')} /></div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Create Event</Button>
        </div>
      </form>
    </Modal>
  );
}
