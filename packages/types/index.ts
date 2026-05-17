// packages/types/index.ts

export type UserRole = 'admin' | 'coordinator' | 'designer' | 'warehouse' | 'client';

export type PipelineStage =
  | 'new_inquiry'
  | 'ocular_scheduled'
  | 'proposal_sent'
  | 'reserved'
  | 'fully_booked'
  | 'done'
  | 'cancelled';

export type EventStatus =
  | 'planning'
  | 'production'
  | 'ready'
  | 'event_day'
  | 'done'
  | 'cancelled';

export type EventType = 'wedding' | 'corporate' | 'birthday' | 'debut' | 'other';

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue' | 'refunded';

export type PaymentType = 'downpayment' | 'midpayment' | 'balance' | 'addon' | 'refund';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ChecklistPhase =
  | 'pre_production'
  | 'fabrication'
  | 'supplier'
  | 'load_in'
  | 'event_day'
  | 'load_out'
  | 'post_event';

export type LogType =
  | 'note'
  | 'incident'
  | 'change_request'
  | 'client_approval'
  | 'sign_off'
  | 'timeline_tick';

export type ReservationStatus = 'reserved' | 'checked_out' | 'returned' | 'cancelled';

export type ClientAccountStatus = 'pending' | 'approved' | 'suspended';

// ─── DTOs / Request shapes ──────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
}

export interface CreateClientDto {
  fullName: string;
  email?: string;
  phone?: string;
  instagram?: string;
  address?: string;
  referredBy?: string;
  notes?: string;
  pipelineStage?: PipelineStage;
}

export interface CreateEventDto {
  name: string;
  eventType: EventType;
  clientId: string;
  venueName?: string;
  venueAddress?: string;
  eventDate: string;
  eventTimeStart?: string;
  eventTimeEnd?: string;
  callTime?: string;
  setupDeadline?: string;
  coordinatorId?: string;
  packageName?: string;
  totalBudget?: number;
  colorPalette?: string;
  teamNotes?: string;
  internalNotes?: string;
}

export interface CreateQuoteDto {
  eventId: string;
  label?: string;
  packageName?: string;
  packageDescription?: string;
  discountType?: string;
  discountValue?: number;
  discountReason?: string;
  taxPercent?: number;
  downpaymentAmount?: number;
  downpaymentDue?: string;
  balanceDueDate?: string;
  inclusionsNote?: string;
  exclusionsNote?: string;
  termsNote?: string;
}

export interface QuoteItemDto {
  category?: string;
  itemName: string;
  description?: string;
  isAddon?: boolean;
  quantity: number;
  unit?: string;
  unitPrice: number;
  sortOrder?: number;
}

export interface CreatePaymentDto {
  eventId: string;
  quoteId?: string;
  paymentType: PaymentType;
  label?: string;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status?: PaymentStatus;
  method?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface CreateTaskDto {
  eventId: string;
  assignedTo?: string;
  title: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedMinutes?: number;
  notes?: string;
}

export interface CreateMeetingDto {
  clientName: string;
  contactNo?: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  packageAvailed: string;
  packageNotes?: string;
  eventId?: string;
}

// ─── Response shapes ─────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
