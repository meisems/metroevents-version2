// apps/api/src/reminders/reminders.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const REMINDER_TEMPLATES: Record<string, string> = {
  payment_due: `Hi {client_name}! Friendly reminder na ang inyong payment na ₱{amount} ay due na sa {due_date}. Salamat po! — Metro Events 🌸`,
  balance_overdue: `Hi {client_name}! Gusto lang po naming i-remind na may outstanding balance pa po kayong ₱{amount} para sa {event_name}. Para sa mga katanungan, huwag mag-atubiling makipag-ugnayan sa amin. Salamat! — Metro Events`,
  ocular_reminder: `Hi {client_name}! Just a reminder na may ocular visit tayo bukas, {date}, sa {venue}. See you po! — Metro Events`,
  event_day: `Magandang umaga, {client_name}! Today is the big day! 🎉 Ang aming team ay nakahandang gawing espesyal ang inyong {event_name}. Call time namin ay {call_time}. Kita-kita na po tayo! — Metro Events`,
  feedback_request: `Hi {client_name}! Thank you so much sa inyong tiwala sa Metro Events para sa inyong {event_name}! Gusto namin malaman ang inyong feedback. Paki-fill out po ang aming form: {feedback_link} — Maraming salamat! 🌟`,
  stale_lead: `Hi {client_name}! Kumusta po kayo? Just checking in regarding your inquiry with Metro Events. Nandito pa rin kami para sagutin ang inyong mga katanungan. — Metro Events`,
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  getTemplates() {
    return Object.entries(REMINDER_TEMPLATES).map(([key, template]) => ({
      key,
      template,
      variables: [...template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]),
    }));
  }

  renderTemplate(key: string, vars: Record<string, string>) {
    const template = REMINDER_TEMPLATES[key];
    if (!template) return null;
    return fillTemplate(template, vars);
  }

  async getOverduePayments() {
    return this.prisma.payment.findMany({
      where: { status: 'pending', dueDate: { lt: new Date() } },
      include: {
        event: {
          include: { client: { select: { id: true, fullName: true, phone: true, email: true } } },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getUpcomingEventReminders(daysAhead = 3) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);

    return this.prisma.event.findMany({
      where: {
        eventDate: { gte: new Date(), lte: cutoff },
        status: { in: ['planning', 'production', 'ready'] },
      },
      include: { client: { select: { fullName: true, phone: true, email: true } } },
      orderBy: { eventDate: 'asc' },
    });
  }

  async getStaleLeads(daysSinceContact = 14) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysSinceContact);

    return this.prisma.client.findMany({
      where: {
        pipelineStage: { in: ['new_inquiry', 'ocular_scheduled', 'proposal_sent'] },
        OR: [
          { lastContacted: { lt: cutoff } },
          { lastContacted: null, inquiryDate: { lt: cutoff } },
        ],
      },
      orderBy: { lastContacted: 'asc' },
    });
  }

  async getAllReminders() {
    const [overduePayments, upcomingEvents, staleLeads] = await Promise.all([
      this.getOverduePayments(),
      this.getUpcomingEventReminders(),
      this.getStaleLeads(),
    ]);
    return { overduePayments, upcomingEvents, staleLeads };
  }
}
