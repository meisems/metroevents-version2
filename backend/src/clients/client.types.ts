export enum CRMStage {
  NEW_INQUIRY = 'new_inquiry',
  OCULAR_SCHEDULED = 'ocular_scheduled',
  PROPOSAL_SENT = 'proposal_sent',
  RESERVED = 'reserved',
  FULLY_BOOKED = 'fully_booked',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  instagram?: string;
  address?: string;
  referralSource?: string;
  stage: CRMStage;
  ocularDate?: string;
  internalNotes?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}
