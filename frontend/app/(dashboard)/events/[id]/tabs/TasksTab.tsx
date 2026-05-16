'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListTodo, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { fmt } from '@/lib/utils';

export default function TasksTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const { data: tasks = [] } = useQuery({ queryKey: ['tasks', eventId], queryFn: () => tasksApi.getByEvent(eventId).then(r => r.data) });

  const toggleMutation = useMutation({ mutationFn: (id: string) => tasksApi.toggle(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', eventId] }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => tasksApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', eventId] }) });

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Task</Button></div>
      <div className="space-y-2">
        {(tasks as any[]).map((t: any) => (
          <div key={t.id} className={`flex items-start gap-3 p-3 rounded-xl border transition ${t.isCompleted ? 'bg-[#0D1117]/30 border-[#0F3460]/20 opacity-70' : 'bg-[#16213E] border-[#0F3460]/40'}`}>
            <button onClick={() => toggleMutation.mutate(t.id)} className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition ${t.isCompleted ? 'bg-brand-gold border-brand-gold' : 'border-gray-600 hover:border-brand-gold'}`}>
              {t.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <div className="flex-1">
              <p className={`text-sm font-medium ${t.isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>{t.title}</p>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                {t.assignedTo && <span>👤 {t.assignedTo}</span>}
                {t.role && <span className="capitalize">{t.role}</span>}
                {t.dueDate && <span>📅 {fmt(t.dueDate)}</span>}
              </div>
              {t.notes && <p className="text-xs text-gray-500 mt-1">{t.notes}</p>}
            </div>
            <button onClick={() => deleteMutation.mutate(t.id)} className="p-1 text-gray-600 hover:text-red-400 transition"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        ))}
        {tasks.length === 0 && <EmptyState icon={ListTodo} title="No tasks yet" sub="Add tasks for your crew." />}
      </div>
      {showAdd && (
        <Modal title="Add Task" onClose={() => setShowAdd(false)}>
          <AddTaskForm eventId={eventId} onCreated={() => { qc.invalidateQueries({ queryKey: ['tasks', eventId] }); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

function AddTaskForm({ eventId, onCreated }: { eventId: string; onCreated: () => void }) {
  const { register, handleSubmit } = useForm({ defaultValues: { title:'', assignedTo:'', role:'coordinator', dueDate:'', notes:'' } });
  const mutation = useMutation({ mutationFn: (d: object) => tasksApi.create({ ...d, eventId }), onSuccess: () => { toast.success('Task added!'); onCreated(); } });
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <Input label="Task *" placeholder="Confirm supplier delivery time" {...register('title')} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Assigned To" placeholder="Juan dela Cruz" {...register('assignedTo')} />
        <Select label="Role" {...register('role')}>
          {['coordinator','designer','warehouse','admin'].map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
        </Select>
        <Input label="Due Date" type="date" {...register('dueDate')} />
      </div>
      <Textarea label="Notes" rows={2} {...register('notes')} />
      <div className="flex justify-end"><Button type="submit" loading={mutation.isPending}>Add Task</Button></div>
    </form>
  );
}
