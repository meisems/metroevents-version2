// apps/web/src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPHP(amount: number | string) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatShortDate(date: string | Date | null | undefined) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function daysUntil(date: string | Date): number {
  const now = new Date();
  const d = new Date(date);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date) < new Date();
}

export const PIPELINE_LABELS: Record<string, string> = {
  new_inquiry: 'New Inquiry',
  ocular_scheduled: 'Ocular Scheduled',
  proposal_sent: 'Proposal Sent',
  reserved: 'Reserved',
  fully_booked: 'Fully Booked',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-800',
  production: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  event_day: 'bg-purple-100 text-purple-800',
  done: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  partial: 'bg-blue-100 text-blue-800',
  overdue: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
};

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-gray-500',
  normal: 'text-blue-600',
  high: 'text-orange-500',
  urgent: 'text-red-600',
};
