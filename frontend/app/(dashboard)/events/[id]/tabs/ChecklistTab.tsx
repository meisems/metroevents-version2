'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { checklistApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { CheckSquare, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { fmt } from '@/lib/utils';

const PHASES = ['Pre-production','Fabrication','Supplier','Load-in','Event Day','Load-out','Post-event'];

export default function ChecklistTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [activePhase, setActivePhase] = useState('');

  const { data: items = [] } = useQuery({ queryKey: ['checklist', eventId], queryFn: () => checklistApi.getByEvent(eventId).then(r => r.data) });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => checklistApi.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', eventId] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => checklistApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['checklist', eventId] }),
  });
  const templateMutation = useMutation({
    mutationFn: (type: string) => checklistApi.loadTemplate(eventId, type),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checklist', eventId] }); toast.success('Template loaded!'); },
  });

  const filtered = activePhase ? (items as any[]).filter((i: any) => i.phase === activePhase) : (items as any[]);
  const checked = (items as any[]).filter((i: any) => i.isChecked).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{checked}/{(items as any[]).length} completed</span>
          <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-gold rounded-full transition-all" style={{ width: `${(items as any[]).length ? (checked / (items as any[]).length) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['wedding','corporate','birthday'].map(t => (
            <Button key={t} variant="outline" onClick={() => templateMutation.mutate(t)} className="text-xs capitalize">{t} template</Button>
          ))}
          <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Item</Button>
        </div>
      </div>

      {/* Phase filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {['', ...PHASES].map(p => (
          <button key={p} onClick={() => setActivePhase(p)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs border transition ${activePhase === p ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 'bg-[#16213E] border-[#0F3460]/40 text-gray-400 hover:text-white'}`}>
            {p || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item: any) => (
          <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border transition ${item.isChecked ? 'bg-[#0D1117]/30 border-[#0F3460]/20 opacity-70' : 'bg-[#16213E] border-[#0F3460]/40'}`}>
            <button onClick={() => toggleMutation.mutate(item.id)} className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 transition flex items-center justify-center ${item.isChecked ? 'bg-brand-gold border-brand-gold' : 'border-gray-600 hover:border-brand-gold'}`}>
              {item.isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${item.isChecked ? 'line-through text-gray-500' : 'text-white'}`}>{item.title}</p>
              {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
              <div className="flex gap-3 mt-1 text-xs text-gray-600">
                <span>📋 {item.phase}</span>
                {item.role && <span>👤 {item.role}</span>}
                {item.dueDate && <span>📅 {fmt(item.dueDate)}</span>}
                {item.isChecked && item.checkedBy && <span className="text-brand-gold/70">✓ {item.checkedBy}</span>}
              </div>
            </div>
            <button onClick={() => deleteMutation.mutate(item.id)} className="p-1 text-gray-600 hover:text-red-400 transition shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {filtered.length === 0 && <EmptyState icon={CheckSquare} title="No checklist items" sub="Add items or load a template." />}
      </div>

      {showAdd && (
        <Modal title="Add Checklist Item" onClose={() => setShowAdd(false)}>
          <AddChecklistForm eventId={eventId} onCreated={() => { qc.invalidateQueries({ queryKey: ['checklist', eventId] }); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

function AddChecklistForm({ eventId, onCreated }: { eventId: string; onCreated: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues: { title:'', phase:'Pre-production', role:'', dueDate:'', description:'' } });
  const mutation = useMutation({ mutationFn: (d: object) => checklistApi.create({ ...d, eventId }), onSuccess: () => { toast.success('Item added!'); onCreated(); } });
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <Input label="Title *" placeholder="Confirm flowers order" {...register('title')} />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Phase" {...register('phase')}>{PHASES.map(p => <option key={p} value={p}>{p}</option>)}</Select>
        <Select label="Responsible Role" {...register('role')}>
          <option value="">Any</option>
          {['coordinator','designer','warehouse'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
        </Select>
        <Input label="Due Date" type="date" {...register('dueDate')} />
      </div>
      <Textarea label="Description" rows={2} {...register('description')} />
      <div className="flex justify-end gap-2"><Button type="submit" loading={mutation.isPending}>Add Item</Button></div>
    </form>
  );
}
