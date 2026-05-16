import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary'|'ghost'|'danger'|'outline'; loading?: boolean; }

const variants = {
  primary: 'bg-brand-gold hover:bg-brand-gold-light text-white font-semibold',
  ghost:   'text-gray-400 hover:text-white hover:bg-gray-800',
  danger:  'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30',
  outline: 'border border-[#0F3460]/60 hover:border-brand-gold/40 text-gray-300 hover:text-white',
};

export function Button({ variant = 'primary', loading, children, className, disabled, ...props }: BtnProps) {
  return (
    <button className={cn('inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed', variants[variant], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{children}
    </button>
  );
}
