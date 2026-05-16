export enum EventStatus {
  PLANNING = 'planning',
  PRODUCTION = 'production',
  READY = 'ready',
  EVENT_DAY = 'event_day',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum EventType {
  WEDDING = 'wedding',
  DEBUT = 'debut',
  BIRTHDAY = 'birthday',
  CORPORATE = 'corporate',
  SPECIAL = 'special',
  OTHER = 'other',
}

export interface Event {
  id: string;
  title: string;
  type: EventType;
  status: EventStatus;
  eventDate: string;
  venue?: string;
  venueAddress?: string;
  guestCount?: number;
  packageName?: string;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  notes?: string;
  clientId: string;
  client?: { id: string; fullName: string; email: string };
  coordinatorId?: string;
  designerId?: string;
  createdAt: string;
  updatedAt: string;
}
