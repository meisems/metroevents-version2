'use client';
import { EmptyState } from '@/components/ui/EmptyState';
import { Truck } from 'lucide-react';

export default function SuppliersTab({ eventId }: { eventId: string }) {
  return (
    <div>
      <EmptyState icon={Truck} title="Supplier POs for this event" sub="Purchase order management coming soon." />
    </div>
  );
}
