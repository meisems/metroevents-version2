export type Role = 'admin' | 'coordinator' | 'designer' | 'warehouse' | 'client';

export interface User {
  id: string; name: string; email: string; role: Role; isActive: boolean; lastLogin?: string;
}

export interface Client {
  id: string; name: string; email: string; phone: string; instagram?: string;
  address?: string; referralSource?: string; stage: CRMStage;
  ocularDate?: string; notes?: string; lastContacted?: string; createdAt: string;
}

export type CRMStage = 'new_inquiry'|'ocular_scheduled'|'proposal_sent'|'reserved'|'fully_booked'|'done'|'cancelled';

export interface Event {
  id: string; title: string; clientId: string; clientName?: string;
  eventDate: string; venue: string; type: EventType; status: EventStatus;
  guestCount?: number; totalAmount?: number; totalPaid?: number; createdAt: string;
}

export type EventType = 'wedding'|'debut'|'birthday'|'corporate'|'christening'|'graduation'|'other';
export type EventStatus = 'planning'|'production'|'ready'|'event_day'|'done'|'cancelled';

export interface Quote {
  id: string; eventId: string; version: number; status: 'draft'|'sent'|'approved'|'rejected';
  subtotal: number; discount: number; discountType: 'percent'|'fixed';
  tax: number; grandTotal: number; downpayment?: number;
  downpaymentDue?: string; balanceDue?: string;
  inclusions?: string; exclusions?: string; terms?: string;
  approvedAt?: string; approvedBy?: string;
  items: QuoteItem[];
}
export interface QuoteItem {
  id: string; category: string; itemName: string; qty: number;
  unit: string; unitPrice: number; total: number;
}

export interface Payment {
  id: string; eventId: string; type: PaymentType; status: PaymentStatus;
  amount: number; dueDate?: string; paidDate?: string; method?: string;
  referenceNo?: string; notes?: string;
}
export type PaymentType = 'downpayment'|'mid_payment'|'balance'|'addon'|'refund';
export type PaymentStatus = 'pending'|'paid'|'partial'|'overdue'|'refunded';

export interface InventoryItem {
  id: string; sku: string; name: string; category: string;
  totalQty: number; availableQty: number; location?: string;
  replacementCost?: number; rentalPrice?: number; condition: string; photo?: string;
}

export interface Supplier {
  id: string; companyName: string; contactPerson?: string; category: string;
  email?: string; phone?: string; address?: string; rating: number;
  onTimeCount: number; lateCount: number; issueCount: number; isPreferred: boolean;
}

export interface Meeting {
  id: string; clientName: string; contactNumber?: string;
  meetingDate: string; meetingTime: string; location: string;
  packageDiscussed?: string; notes?: string; status: MeetingStatus; eventId?: string;
}
export type MeetingStatus = 'scheduled'|'completed'|'cancelled'|'no_show';

export interface ChecklistItem {
  id: string; eventId: string; phase: string; title: string;
  description?: string; role?: string; dueDate?: string;
  isChecked: boolean; checkedBy?: string; checkedAt?: string; notes?: string;
}

export interface Task {
  id: string; eventId: string; title: string; assignedTo?: string;
  role?: string; dueDate?: string; isCompleted: boolean; notes?: string;
}

export interface MoodboardPeg {
  id: string; eventId: string; category: string; imageUrl?: string;
  sourceUrl?: string; notes?: string; isApproved: boolean; isClientUpload: boolean;
}

export interface EventLog {
  id: string; eventId: string; type: string; content: string;
  photoUrl?: string; costImpact?: number; clientSignoff?: string; createdAt: string; createdBy?: string;
}

export interface Reservation {
  id: string; inventoryItemId: string; eventId: string;
  reservedDate: string; qty: number; status: string;
}
