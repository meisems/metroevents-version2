// apps/web/src/app/(dashboard)/events/[id]/tabs/FilesTab.tsx
'use client';
import { useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const FILE_CATS = ['contract', 'floor_plan', 'proof_of_payment', 'design_ref', 'permit', 'other'];

const ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
};

export default function FilesTab({ event }: { event: any }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: files } = useQuery({
    queryKey: ['files', event.id],
    queryFn: () => api.get(`/files/event/${event.id}`).then((r) => r.data),
  });

  const upload = useMutation({
    mutationFn: async ({ file, category }: { file: File; category: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      return api.post(`/files/event/${event.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', event.id] }),
  });

  const toggleVisible = useMutation({
    mutationFn: (id: string) => api.patch(`/files/${id}/toggle-visibility`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', event.id] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/files/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['files', event.id] }),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ file, category: 'other' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Files & Documents</h2>
        <div>
          <button className="btn-primary text-sm" onClick={() => fileRef.current?.click()} disabled={upload.isPending}>
            {upload.isPending ? 'Uploading…' : '+ Upload File'}
          </button>
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3">File</th>
              <th className="text-left px-4 py-3">Category</th>
              <th className="text-left px-4 py-3">Size</th>
              <th className="text-left px-4 py-3">Client Visible</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!files?.length ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">No files uploaded yet.</td>
              </tr>
            ) : (
              files.map((f: any) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ICONS[f.mimeType] ?? '📎'}</span>
                      <div>
                        <a
                          href={f.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-700 hover:underline line-clamp-1"
                        >
                          {f.originalFilename}
                        </a>
                        {f.description && <p className="text-xs text-gray-400">{f.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-600">{f.category?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-500">{f.fileSizeKb ? `${f.fileSizeKb} KB` : '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisible.mutate(f.id)}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        f.isClientVisible
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {f.isClientVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => remove.mutate(f.id)}
                      className="text-xs text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
