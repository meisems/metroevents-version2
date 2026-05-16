import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function fmt(dateStr?: string, pattern = 'MMM d, yyyy') {
  if (!dateStr) return '—';
  try { return format(parseISO(dateStr), pattern); } catch { return dateStr; }
}

export function peso(amount?: number) {
  if (amount === undefined || amount === null) return '—';
  return '₱' + Number(amount).toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

export const CRM_STAGES: Record<string, { label: string; color: string }> = {
  new_inquiry:      { label: 'New Inquiry',      color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  ocular_scheduled: { label: 'Ocular Scheduled', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  proposal_sent:    { label: 'Proposal Sent',    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  reserved:         { label: 'Reserved',         color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  fully_booked:     { label: 'Fully Booked',     color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  done:             { label: 'Done',             color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  cancelled:        { label: 'Cancelled',        color: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export const EVENT_STATUSES: Record<string, { label: string; color: string }> = {
  planning:   { label: 'Planning',   color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  production: { label: 'Production', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  ready:      { label: 'Ready',      color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  event_day:  { label: 'Event Day',  color: 'bg-green-400/20 text-green-300 border-green-400/30' },
  done:       { label: 'Done',       color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  paid:      { label: 'Paid',      color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  partial:   { label: 'Partial',   color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  overdue:   { label: 'Overdue',   color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  refunded:  { label: 'Refunded',  color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
};
