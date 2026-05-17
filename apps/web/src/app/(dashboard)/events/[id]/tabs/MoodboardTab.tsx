// apps/web/src/app/(dashboard)/events/[id]/tabs/MoodboardTab.tsx
'use client';
import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const CATEGORIES = ['Backdrop', 'Florals', 'Table Setup', 'Lighting', 'Color Reference', 'Styling', 'Other'];

export default function MoodboardTab({ event }: { event: any }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('');
  const [filter, setFilter] = useState('');

  const { data: pegs } = useQuery({
    queryKey: ['moodboard', event.id],
    queryFn: () => api.get(`/moodboard/event/${event.id}`).then((r) => r.data),
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) formData.append('caption', caption);
      if (category) formData.append('category', category);
      return api.post(`/moodboard/event/${event.id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['moodboard', event.id] });
      setCaption('');
      setCategory('');
    },
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.patch(`/moodboard/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard', event.id] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/moodboard/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['moodboard', event.id] }),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate(file);
  };

  const filteredPegs = filter ? pegs?.filter((p: any) => p.category === filter) : pegs;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Moodboard / Design Pegs</h2>
        <div className="flex gap-2">
          <input
            className="input max-w-[140px]"
            placeholder="Caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          <select className="input max-w-[160px]" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn-primary text-sm" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? 'Uploading…' : '+ Upload Peg'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${!filter ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(filter === c ? '' : c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${filter === c ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Image Grid */}
      {!filteredPegs?.length ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎨</p>
          <p>No pegs yet. Upload inspiration images to start the moodboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPegs.map((peg: any) => (
            <div key={peg.id} className="group relative rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <img
                src={peg.imageUrl}
                alt={peg.caption ?? 'Design peg'}
                className="w-full h-full object-cover"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-2">
                  {!peg.isApproved && (
                    <button
                      onClick={() => approve.mutate(peg.id)}
                      className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium hover:bg-green-400"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => remove.mutate(peg.id)}
                    className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-400"
                  >
                    ✕
                  </button>
                </div>
                {(peg.caption || peg.category) && (
                  <div className="text-white">
                    {peg.category && <p className="text-xs text-white/70">{peg.category}</p>}
                    {peg.caption && <p className="text-xs font-medium">{peg.caption}</p>}
                  </div>
                )}
              </div>
              {peg.isApproved && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
