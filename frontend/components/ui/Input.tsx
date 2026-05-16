import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const inputCls = 'w-full px-3 py-2 bg-[#0D1117] border border-[#0F3460]/60 rounded-lg text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 transition';
export const labelCls = 'text-xs text-gray-400 block mb-1 font-medium';
export const selectCls = cn(inputCls, 'cursor-pointer');

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className, ...props }, ref) => (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <input ref={ref} className={cn(inputCls, error && 'border-red-500/60', className)} {...props} />
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }>(
  ({ label, className, ...props }, ref) => (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <textarea ref={ref} className={cn(inputCls, 'resize-none', className)} {...props} />
    </div>
  )
);
Textarea.displayName = 'Textarea';

export function Select({ label, children, className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      <select className={cn(selectCls, className)} {...props}>{children}</select>
    </div>
  );
}
