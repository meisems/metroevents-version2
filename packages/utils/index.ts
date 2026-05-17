// packages/utils/index.ts

import { PipelineStage, EventStatus, PaymentStatus } from '@metro/types';

// ─── Event ID Generator ──────────────────────────────────────────────────────

export function generateEventCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

// ─── Pipeline ────────────────────────────────────────────────────────────────

export const PIPELINE_ORDER: PipelineStage[] = [
  'new_inquiry',
  'ocular_scheduled',
  'proposal_sent',
  'reserved',
  'fully_booked',
  'done',
];

export function nextPipelineStage(current: PipelineStage): PipelineStage | null {
  const idx = PIPELINE_ORDER.indexOf(current);
  if (idx === -1 || idx >= PIPELINE_ORDER.length - 1) return null;
  return PIPELINE_ORDER[idx + 1];
}

export const PIPELINE_LABELS: Record<PipelineStage, string> = {
  new_inquiry: 'New Inquiry',
  ocular_scheduled: 'Ocular Scheduled',
  proposal_sent: 'Proposal Sent',
  reserved: 'Reserved',
  fully_booked: 'Fully Booked',
  done: 'Done',
  cancelled: 'Cancelled',
};

// ─── Status label maps ────────────────────────────────────────────────────────

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  planning: 'Planning',
  production: 'Production',
  ready: 'Ready',
  event_day: 'Event Day',
  done: 'Done',
  cancelled: 'Cancelled',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  partial: 'Partial',
  overdue: 'Overdue',
  refunded: 'Refunded',
};

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatPHP(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isOverdue(dueDate: string | Date): boolean {
  return new Date(dueDate) < new Date();
}

// ─── Reminder templates (Taglish) ────────────────────────────────────────────

export const REMINDER_TEMPLATES = {
  payment_due: `Hi {client_name}! Friendly reminder na ang inyong payment na ₱{amount} ay due na sa {due_date}. Salamat po! — Metro Events 🌸`,
  balance_overdue: `Hi {client_name}! Gusto lang po naming i-remind na may outstanding balance pa po kayong ₱{amount} para sa {event_name}. Para sa mga katanungan, huwag mag-atubiling makipag-ugnayan sa amin. Salamat! — Metro Events`,
  ocular_reminder: `Hi {client_name}! Just a reminder na may ocular visit tayo bukas, {date}, sa {venue}. See you po! — Metro Events`,
  event_day: `Magandang umaga, {client_name}! Today is the big day! 🎉 Ang aming team ay nakahandang gawing espesyal ang inyong {event_name}. Call time namin ay {call_time}. Kita-kita na po tayo! — Metro Events`,
  feedback_request: `Hi {client_name}! Thank you so much sa inyong tiwala sa Metro Events para sa inyong {event_name}! Gusto namin malaman ang inyong feedback. Paki-fill out po ang aming form: {feedback_link} — Maraming salamat! 🌟`,
};

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

// ─── Checklist templates ──────────────────────────────────────────────────────

export const CHECKLIST_TEMPLATES = {
  wedding: [
    { phase: 'pre_production', title: 'Client ocular / site visit', responsibleRole: 'coordinator' },
    { phase: 'pre_production', title: 'Finalize floor plan layout', responsibleRole: 'designer' },
    { phase: 'pre_production', title: 'Confirm color palette and theme', responsibleRole: 'designer' },
    { phase: 'pre_production', title: 'Sign contract and collect downpayment', responsibleRole: 'coordinator' },
    { phase: 'pre_production', title: 'Submit permit to venue', responsibleRole: 'coordinator' },
    { phase: 'fabrication', title: 'Backdrop fabrication start', responsibleRole: 'designer' },
    { phase: 'fabrication', title: 'Floral arrangement prep', responsibleRole: 'designer' },
    { phase: 'fabrication', title: 'Table centerpiece assembly', responsibleRole: 'designer' },
    { phase: 'supplier', title: 'Confirm caterer', responsibleRole: 'coordinator' },
    { phase: 'supplier', title: 'Confirm host / emcee', responsibleRole: 'coordinator' },
    { phase: 'supplier', title: 'Confirm AV / sound system', responsibleRole: 'coordinator' },
    { phase: 'supplier', title: 'Confirm photographer / videographer', responsibleRole: 'coordinator' },
    { phase: 'load_in', title: 'Truck loading checklist signed off', responsibleRole: 'warehouse' },
    { phase: 'load_in', title: 'Delivery to venue on time', responsibleRole: 'warehouse' },
    { phase: 'load_in', title: 'Setup complete before deadline', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Team briefing at call time', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Client walkthrough and sign-off', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Event log updates every hour', responsibleRole: 'coordinator' },
    { phase: 'load_out', title: 'All items accounted for and loaded', responsibleRole: 'warehouse' },
    { phase: 'load_out', title: 'Venue left clean', responsibleRole: 'warehouse' },
    { phase: 'post_event', title: 'Return all rentals to warehouse', responsibleRole: 'warehouse' },
    { phase: 'post_event', title: 'Collect final balance', responsibleRole: 'coordinator' },
    { phase: 'post_event', title: 'Send feedback form to client', responsibleRole: 'coordinator' },
  ],
  corporate: [
    { phase: 'pre_production', title: 'Receive event brief / BOQ from client', responsibleRole: 'coordinator' },
    { phase: 'pre_production', title: 'Site inspection', responsibleRole: 'coordinator' },
    { phase: 'pre_production', title: 'Finalize stage and layout design', responsibleRole: 'designer' },
    { phase: 'pre_production', title: 'Confirm branding materials', responsibleRole: 'designer' },
    { phase: 'supplier', title: 'Confirm AV / LED wall supplier', responsibleRole: 'coordinator' },
    { phase: 'supplier', title: 'Confirm catering', responsibleRole: 'coordinator' },
    { phase: 'load_in', title: 'Early access confirmed with venue', responsibleRole: 'coordinator' },
    { phase: 'load_in', title: 'All props and materials delivered', responsibleRole: 'warehouse' },
    { phase: 'event_day', title: 'AV dry run / sound check', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Client representative briefed', responsibleRole: 'coordinator' },
    { phase: 'load_out', title: 'All items returned to truck', responsibleRole: 'warehouse' },
    { phase: 'post_event', title: 'Issue final invoice', responsibleRole: 'coordinator' },
    { phase: 'post_event', title: 'Send post-event report to client', responsibleRole: 'coordinator' },
  ],
  birthday: [
    { phase: 'pre_production', title: 'Theme and color palette confirmed', responsibleRole: 'designer' },
    { phase: 'pre_production', title: 'Guest count finalized', responsibleRole: 'coordinator' },
    { phase: 'fabrication', title: 'Balloon arrangements prepared', responsibleRole: 'designer' },
    { phase: 'fabrication', title: 'Backdrop and photo wall set up', responsibleRole: 'designer' },
    { phase: 'supplier', title: 'Confirm cake supplier', responsibleRole: 'coordinator' },
    { phase: 'supplier', title: 'Confirm party favors', responsibleRole: 'coordinator' },
    { phase: 'load_in', title: 'Setup complete 1 hour before event', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Birthday surprise coordination', responsibleRole: 'coordinator' },
    { phase: 'load_out', title: 'All rented items retrieved', responsibleRole: 'warehouse' },
    { phase: 'post_event', title: 'Balance collected', responsibleRole: 'coordinator' },
  ],
};
