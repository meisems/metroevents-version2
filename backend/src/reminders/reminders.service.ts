import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { Event, EventStatus } from '../events/event.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { PurchaseOrder } from '../suppliers/supplier.entity';
import { Client, CRMStage } from '../clients/client.entity';
import { addDays, subDays } from 'date-fns';

const TAGLISH_TEMPLATES = [
  {
    id: 'new_inquiry',
    name: 'New Inquiry Auto-Reply',
    subject: 'Thank you for reaching out to Metro Events! 🎉',
    body: `Hi {{clientName}}!

Salamat sa inyong mensahe! 🙏 We received your inquiry and we're so excited to potentially work with you!

Our team will reach out to you within 24 hours to discuss your event needs. 

Para sa mas mabilis na tugon, feel free to reply to this message anytime. 😊

Hanggang sa makita tayo! 
Metro Events Team`,
  },
  {
    id: 'ocular_schedule',
    name: 'Ocular Schedule Confirmation',
    subject: 'Ocular Visit Confirmation — Metro Events',
    body: `Hi {{clientName}}!

We'd like to confirm your ocular visit:

📅 Date: {{ocularDate}}
📍 Venue: {{venue}}

Please let us know if you need to reschedule. We look forward to seeing you!

Maraming salamat,
Metro Events Team`,
  },
  {
    id: 'proposal_sent',
    name: 'Proposal Sent Follow-up',
    subject: 'Your Event Proposal is Ready! 📋',
    body: `Hi {{clientName}}!

We've sent over your event proposal. Please take a moment to review it and let us know if you have any questions or requests for revisions.

Event Date: {{eventDate}}
Package: {{packageName}}
Grand Total: {{grandTotal}}

Once you're happy with everything, you can approve the quote directly from your client portal.

Looking forward to making your dream event happen! ✨
Metro Events Team`,
  },
  {
    id: 'balance_reminder',
    name: 'Balance Due Reminder',
    subject: 'Friendly Reminder: Balance Due — Metro Events',
    body: `Hi {{clientName}},

Gusto lang naming ipaalala na ang inyong balance na ₱{{balance}} ay due na sa {{balanceDueDate}}.

Maaari kayong mag-bayad sa pamamagitan ng:
• GCash: 09XX-XXX-XXXX
• Bank Transfer: BDO 1234-5678-90
• Cash (sa opisina namin)

Kung mayroon kayong katanungan, huwag mag-atubiling makipag-ugnayan sa amin.

Salamat,
Metro Events Team`,
  },
  {
    id: 'fully_booked',
    name: 'Fully Booked Confirmation',
    subject: "You're officially booked! 🎊",
    body: `Hi {{clientName}}!

CONGRATULATIONS! 🥳 You are now officially booked with Metro Events!

Event Date: {{eventDate}}
Venue: {{venue}}

Our team will be in touch as we begin production planning. Sa araw na iyon, ibibigay namin ang pinakamahusay naming serbisyo para sa inyo!

Para sa mga katanungan, maaari kayong makipag-ugnayan sa aming coordinator anumang oras.

Excited na kaming para sa inyong event! 🎉
Metro Events Team`,
  },
  {
    id: 'feedback_request',
    name: 'Post-Event Feedback Request',
    subject: 'How was your event? We\'d love to hear from you! 💛',
    body: `Hi {{clientName}}!

It was an absolute honor to be part of your {{eventType}} last {{eventDate}}! 🙏

Sana ay naging maayos ang lahat at nalampasan namin ang inyong mga inaasahan. 

We would really appreciate it if you could take a few minutes to leave us a review. Your feedback helps us serve future clients better!

You can rate us directly in your client portal.

Muli, maraming salamat sa inyong tiwala.
Metro Events Team 💛`,
  },
  {
    id: 'followup_no_response',
    name: 'Follow-up (No Response)',
    subject: 'Checking in — Metro Events',
    body: `Hi {{clientName}}!

Kumusta po? 😊 Just checking in on your event inquiry. 

We understand bihasa ang inyong oras, so no pressure! Pero kung gusto pa rin ninyong pag-usapan ang inyong event, nandito kami anytime.

Feel free to reply dito or call/message us directly.

Salamat,
Metro Events Team`,
  },
];

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
    @InjectRepository(Payment) private paymentsRepo: Repository<Payment>,
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
    @InjectRepository(Client) private clientsRepo: Repository<Client>,
  ) {}

  async getDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const in7days = addDays(new Date(), 7).toISOString().split('T')[0];
    const staleDate = subDays(new Date(), 7).toISOString().split('T')[0];
    const tomorrow = addDays(new Date(), 1).toISOString().split('T')[0];
    const in3days = addDays(new Date(), 3).toISOString().split('T')[0];

    const [upcomingEvents, overduePayments, dueSoonPayments, deliveriesToday, staleClients] =
      await Promise.all([
        this.eventsRepo
          .createQueryBuilder('e')
          .leftJoinAndSelect('e.client', 'client')
          .where('e.eventDate >= :today', { today })
          .andWhere('e.eventDate <= :in7days', { in7days })
          .andWhere('e.status NOT IN (:...done)', {
            done: [EventStatus.DONE, EventStatus.CANCELLED],
          })
          .orderBy('e.eventDate', 'ASC')
          .getMany(),

        this.paymentsRepo.find({
          where: { dueDate: LessThan(today), status: PaymentStatus.PENDING },
          relations: ['event'],
        }),

        this.paymentsRepo.find({
          where: {
            dueDate: Between(today, in3days),
            status: PaymentStatus.PENDING,
          },
          relations: ['event'],
        }),

        this.poRepo.find({
          where: { deliveryDate: Between(today, tomorrow) },
          relations: ['supplier'],
        }),

        this.clientsRepo
          .createQueryBuilder('c')
          .where('c.stage = :stage', { stage: CRMStage.PROPOSAL_SENT })
          .andWhere('(c.lastContactedAt IS NULL OR c.lastContactedAt <= :staleDate)', { staleDate })
          .getMany(),
      ]);

    return {
      upcomingEvents,
      overduePayments,
      dueSoonPayments,
      deliveriesToday,
      staleClients,
    };
  }

  getTemplates() {
    return TAGLISH_TEMPLATES;
  }

  fillTemplate(templateId: string, data: Record<string, string>) {
    const tpl = TAGLISH_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return null;
    let body = tpl.body;
    for (const [key, value] of Object.entries(data)) {
      body = body.replaceAll(`{{${key}}}`, value);
    }
    return { ...tpl, body };
  }
}
