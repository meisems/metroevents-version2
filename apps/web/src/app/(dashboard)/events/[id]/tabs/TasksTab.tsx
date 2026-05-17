// apps/web/src/app/(dashboard)/events/[id]/tabs/TasksTab.tsx
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { formatShortDate, PRIORITY_COLORS } from '@/lib/utils';

const PRIORITIES = ['low', 'normal', 'high', 'urgent'];

export default function TasksTab({ event }: { event: any }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'normal', dueDate: '', assignedTo: '', description: '' });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', event.id],
    queryFn: () => api.get(`/tasks/event/${event.id}`).then((r) => r.data),
  });

  const createTask = useMutation({
    mutationFn: (data: any) => api.post('/tasks', { ...data, eventId: event.id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', event.id] });
      setShowForm(false);
      setForm({ title: '', priority: 'normal', dueDate: '', assignedTo: '', description: '' });
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ id, isDone }: { id: string; isDone: boolean }) =>
      api.patch(`/tasks/${id}/${isDone ? 'uncomplete' : 'complete'}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', event.id] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.delete(`/tasks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', event.id] }),
  });

  const pending = tasks?.filter((t: any) => !t.isDone) ?? [];
  const done = tasks?.filter((t: any) => t.isDone) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Tasks ({tasks?.length ?? 0})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          + Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="card p-5 space-y-4 border-2 border-slate-200">
          <h3 className="font-medium text-sm">New Task</h3>
          <input
            className="input"
            placeholder="Task title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
            </select>
            <input
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <textarea
            className="input resize-none"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              className="btn-primary text-sm"
              onClick={() => createTask.mutate(form)}
              disabled={!form.title || createTask.isPending}
            >
              {createTask.isPending ? 'Saving…' : 'Save Task'}
            </button>
            <button className="btn-secondary text-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Pending Tasks */}
      {pending.length > 0 && (
        <div className="card divide-y divide-gray-100">
          {pending.map((task: any) => (
            <div key={task.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 group">
              <input
                type="checkbox"
                checked={false}
                onChange={() => toggleTask.mutate({ id: task.id, isDone: false })}
                className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-slate-800"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{task.title}</p>
                {task.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>}
                <div className="flex gap-3 mt-1.5">
                  <span className={`text-xs font-medium capitalize ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-400">Due {formatShortDate(task.dueDate)}</span>
                  )}
                  {task.assignedUser && (
                    <span className="text-xs text-gray-400">→ {task.assignedUser.name}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => deleteTask.mutate(task.id)}
                className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Done Tasks */}
      {done.length > 0 && (
        <details className="card">
          <summary className="p-4 cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
            ✓ Done ({done.length})
          </summary>
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {done.map((task: any) => (
              <div key={task.id} className="flex items-center gap-4 p-4 opacity-60">
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleTask.mutate({ id: task.id, isDone: true })}
                  className="w-4 h-4 rounded cursor-pointer accent-slate-800"
                />
                <p className="text-sm line-through text-gray-500">{task.title}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      {!tasks?.length && (
        <div className="text-center py-12 text-gray-400">
          No tasks yet. Add one to get started.
        </div>
      )}
    </div>
  );
}
