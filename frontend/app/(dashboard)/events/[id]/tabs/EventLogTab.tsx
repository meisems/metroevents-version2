'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventLogApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Select, Textarea, Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { fmt } from '@/lib/utils';

const LOG_TYPES = ['note','incident','change_request','client_approval','sign_off','timeline_tick'];
const LOG_EMOJIS: Record<string, string> = { note:'📝', incident:'⚠️', change_request:'🔄', client_approval:'✅', sign_off:'🏁', timeline_tick:'⏰' };

export default function EventLogTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { data: logs = [] } = useQuery({ queryKey: ['eventlog', eventId], queryFn: () => eventLogApi.getByEvent(eventId).then(r => r.data) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => eventLogApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['eventlog', eventId] }) });

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Log Entry</Button></div>
      <div className="space-y-3">
        {(logs as any[]).map((log: any) => (
          <div key={log.id} className="flex gap-3 bg-[#16213E] rounded-xl border border-[#0F3460]/40 p-4">
            <div className="text-xl shrink-0 mt-0.5">{LOG_EMOJIS[log.type] ?? '📝'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-brand-gold capitalize font-medium">{log.type?.replace('_', ' ')}</span>
                <span className="text-xs text-gray-500">{fmt(log.createdAt, 'MMM d · h:mm a')}</span>
                {log.createdBy && <span className="text-xs text-gray-600">by {log.createdBy}</span>}
              </div>
              <p className="text-sm text-gray-300">{log.content}</p>
              {log.costImpact > 0 && <p className="text-xs text-amber-400 mt-1">Cost impact: +₱{log.costImpact?.toLocaleString()}</p>}
              {log.clientSignoff && <p className="text-xs text-green-400 mt-1">Signed off by: {log.clientSignoff}</p>}
            </div>
            <button onClick={() => deleteMutation.mutate(log.id)} className="text-gray-600 hover:text-red-400 transition shrink-0 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {logs.length === 0 && <EmptyState icon={ClipboardList} title="No log entries yet" sub="Use this during the event day to record everything in real time." />}
      </div>
      {showAdd && (
        <Modal title="Add Log Entry" onClose={() => setShowAdd(false)}>
          <AddLogForm eventId={eventId} onCreated={() => { qc.invalidateQueries({ queryKey: ['eventlog', eventId] }); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

function AddLogForm({ eventId, onCreated }: any) {
  const { register, handleSubmit, watch } = useForm({ defaultValues: { type:'note', content:'', costImpact:0, clientSignoff:'' } });
  const logType = watch('type');
  const mutation = useMutation({ mutationFn: (d: object) => eventLogApi.create({ ...d, eventId }), onSuccess: () => { toast.success('Log entry added!'); onCreated(); } });
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <Select label="Log Type" {...register('type')}>{LOG_TYPES.map(t => <option key={t} value={t}>{LOG_EMOJIS[t]} {t.replace('_', ' ')}</option>)}</Select>
      <Textarea label="Content *" rows={4} placeholder="Describe what happened…" {...register('content')} />
      {logType === 'change_request' && <Input label="Cost Impact (₱)" type="number" {...register('costImpact', { valueAsNumber: true })} />}
      {(logType === 'change_request' || logType === 'client_approval' || logType === 'sign_off') && <Input label="Client Sign-off Name" placeholder="Maria Santos" {...register('clientSignoff')} />}
      <div className="flex justify-end"><Button type="submit" loading={mutation.isPending}>Add Entry</Button></div>
    </form>
  );
}
