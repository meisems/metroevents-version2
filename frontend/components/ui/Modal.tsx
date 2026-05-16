'use client';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps { title: string; onClose: () => void; children: React.ReactNode; size?: 'sm'|'md'|'lg'|'xl'|'2xl'; }

export function Modal({ title, onClose, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', '2xl': 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className={cn('w-full bg-[#16213E] border border-[#0F3460]/60 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]', widths[size])} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0F3460]/40 shrink-0">
          <h2 className="font-bold text-white text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-800 transition text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
