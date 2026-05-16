'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moodboardApi } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Image, Plus, Check, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const CATS = ['Overall theme','Flowers','Backdrop','Table setting','Lighting','Color palette','Venue layout','Bride look','Client uploaded','Approved final'];

export default function MoodboardTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState('');
  const { data: pegs = [] } = useQuery({ queryKey: ['moodboard', eventId], queryFn: () => moodboardApi.getByEvent(eventId).then(r => r.data) });
  const approveMutation = useMutation({ mutationFn: (id: string) => moodboardApi.approve(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard', eventId] }) });
  const deleteMutation = useMutation({ mutationFn: (id: string) => moodboardApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard', eventId] }) });

  const filtered = activeCategory ? (pegs as any[]).filter((p: any) => p.category === activeCategory) : (pegs as any[]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
          {['', ...CATS].map(c => (
            <button key={c} onClick={() => setActiveCategory(c)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs border transition ${activeCategory === c ? 'bg-brand-gold/20 text-brand-gold border-brand-gold/30' : 'bg-[#16213E] border-[#0F3460]/40 text-gray-400 hover:text-white'}`}>
              {c || 'All'}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Peg</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((peg: any) => (
          <div key={peg.id} className={cn('rounded-xl border overflow-hidden group relative', peg.isApproved ? 'border-brand-gold/40' : 'border-[#0F3460]/40')}>
            <div className="aspect-square bg-[#16213E] flex items-center justify-center">
              {peg.imageUrl ? <img src={peg.imageUrl} alt={peg.category} className="w-full h-full object-cover" /> : <Image className="w-8 h-8 text-gray-600" />}
            </div>
            <div className="p-2">
              <p className="text-xs text-gray-400 truncate">{peg.category}</p>
              {peg.isClientUpload && <span className="text-[10px] text-sky-400">Client upload</span>}
            </div>
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              {!peg.isApproved && <button onClick={() => approveMutation.mutate(peg.id)} className="p-2 bg-brand-gold rounded-full text-white"><Check className="w-4 h-4" /></button>}
              <button onClick={() => deleteMutation.mutate(peg.id)} className="p-2 bg-red-500/80 rounded-full text-white"><Trash2 className="w-4 h-4" /></button>
            </div>
            {peg.isApproved && <div className="absolute top-2 right-2 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-5"><EmptyState icon={Image} title="No pegs yet" sub="Add inspiration images." /></div>}
      </div>

      {showAdd && (
        <Modal title="Add Moodboard Peg" onClose={() => setShowAdd(false)}>
          <AddPegForm eventId={eventId} onCreated={() => { qc.invalidateQueries({ queryKey: ['moodboard', eventId] }); setShowAdd(false); }} />
        </Modal>
      )}
    </div>
  );
}

function AddPegForm({ eventId, onCreated }: any) {
  const { register, handleSubmit } = useForm({ defaultValues: { category:'Flowers', imageUrl:'', sourceUrl:'', notes:'' } });
  const mutation = useMutation({ mutationFn: (d: object) => moodboardApi.create({ ...d, eventId }), onSuccess: () => { toast.success('Peg added!'); onCreated(); } });
  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-3">
      <Select label="Category" {...register('category')}>{CATS.map(c => <option key={c} value={c}>{c}</option>)}</Select>
      <Input label="Image URL" placeholder="https://…" {...register('imageUrl')} />
      <Input label="Source URL (Pinterest/Instagram)" placeholder="https://pinterest.com/…" {...register('sourceUrl')} />
      <Textarea label="Notes" rows={2} {...register('notes')} />
      <div className="flex justify-end"><Button type="submit" loading={mutation.isPending}>Add Peg</Button></div>
    </form>
  );
}
