
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OrderRequest } from '../public/order-request.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host:   config.get('MAIL_HOST'),
      port:   +config.get<number>('MAIL_PORT', 587),
      secure: +config.get<number>('MAIL_PORT', 587) === 465,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    });
  }

  // ── Internal helper ────────────────────────────────────────────────────────
  private async send(options: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', '"Metro Events" <noreply@metroevents.ph>'),
        ...options,
      });
    } catch (err) {
      // Log but never crash the request — email is non-critical
      this.logger.error(`Failed to send email to ${options.to}: ${err.message}`);
    }
  }

  // ── Shared HTML wrapper ────────────────────────────────────────────────────
  private wrap(title: string, body: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0D1117;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D1117;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#16213E;border-radius:16px;overflow:hidden;border:1px solid #0F3460;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;background:linear-gradient(135deg,#16213E,#0F3460);border-bottom:2px solid #C9A84C;">
            <table width="100%">
              <tr>
                <td>
                  <span style="font-size:22px;font-weight:800;color:#ffffff;">✨ Metro Events</span><br/>
                  <span style="font-size:12px;color:#8B9AB5;">Creating Memories</span>
                </td>
                <td align="right">
                  <span style="font-size:12px;color:#C9A84C;font-weight:600;">hello@metroevents.ph</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 32px;color:#F0F0F0;font-size:15px;line-height:1.75;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#0D1117;border-top:1px solid #0F3460;text-align:center;">
            <p style="color:#6B7280;font-size:12px;margin:0;">
              Metro Events &nbsp;·&nbsp; Bonifacio Global City, Taguig, Metro Manila<br/>
              +63 912 345 6789 &nbsp;·&nbsp; hello@metroevents.ph &nbsp;·&nbsp; @metroeventsph
            </p>
            <p style="color:#374151;font-size:11px;margin:8px 0 0;">
              You received this email because you submitted a request through metroevents.ph
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  AUTH EMAILS
  // ─────────────────────────────────────────────────────────────────────────────

  async sendVerificationEmail(
    to: string,
    firstName: string,
    token: string,
  ): Promise<void> {
    const url = `${this.config.get('FRONTEND_URL')}/verify-email/${token}`;
    await this.send({
      to,
      subject: '✅ Verify your Metro Events account',
      html: this.wrap('Verify Your Email', `
        <h2 style="color:#C9A84C;margin-top:0;">Hi ${firstName}! 👋</h2>
        <p>Thanks for registering with Metro Events. Please verify your email address to complete your account setup.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${url}" style="background:#C9A84C;color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;display:inline-block;">
            Verify My Email
          </a>
        </div>
        <p style="color:#8B9AB5;font-size:13px;">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="color:#8B9AB5;font-size:12px;word-break:break-all;">Or copy this link: ${url}</p>
      `),
    });
  }

  async sendAccountApprovedEmail(to: string, firstName: string): Promise<void> {
    const url = `${this.config.get('FRONTEND_URL')}/login`;
    await this.send({
      to,
      subject: '🎉 Your Metro Events account is approved!',
      html: this.wrap('Account Approved', `
        <h2 style="color:#C9A84C;margin-top:0;">You're in, ${firstName}! 🎊</h2>
        <p>Great news — your Metro Events client account has been approved by our team. You can now log in to access your dedicated event portal.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${url}" style="background:#C9A84C;color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;display:inline-block;">
            Log In to Your Portal
          </a>
        </div>
        <p>Through your portal you can:</p>
        <ul style="color:#D1D5DB;padding-left:20px;">
          <li>View and approve your event proposal</li>
          <li>Track your payments</li>
          <li>Upload moodboard inspiration pegs</li>
          <li>Approve design concepts from our team</li>
        </ul>
        <p style="color:#C9A84C;font-weight:600;">We're so excited to be part of your special day! ✨</p>
      `),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  ORDER REQUEST EMAILS
  // ─────────────────────────────────────────────────────────────────────────────

  async sendOrderRequestAutoReply(
    to: string,
    fullName: string,
    eventDate: string,
    packagePreference: string,
  ): Promise<void> {
    const firstName = fullName.split(' ')[0];
    await this.send({
      to,
      subject: '🎉 We received your Metro Events inquiry!',
      html: this.wrap('Inquiry Received', `
        <h2 style="color:#C9A84C;margin-top:0;">Hi ${firstName}! 🌟</h2>
        <p>
          Salamat sa pag-reach out sa Metro Events! We've received your booking inquiry and our team is reviewing the details.
        </p>
        <div style="background:#0D1117;border-radius:10px;padding:20px 24px;margin:20px 0;border-left:3px solid #C9A84C;">
          <p style="margin:0 0 8px;color:#8B9AB5;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Inquiry Summary</p>
          <p style="margin:0;color:#F0F0F0;"><strong>Name:</strong> ${fullName}</p>
          <p style="margin:4px 0 0;color:#F0F0F0;"><strong>Event Date:</strong> ${eventDate}</p>
          <p style="margin:4px 0 0;color:#F0F0F0;"><strong>Package Interest:</strong> ${packagePreference.charAt(0).toUpperCase() + packagePreference.slice(1)}</p>
        </div>
        <p>
          One of our coordinators will get back to you <strong>within 24 hours</strong> to discuss your event details and answer any questions.
        </p>
        <p style="color:#8B9AB5;font-size:14px;">
          In the meantime, follow us on Instagram <strong style="color:#C9A84C;">@metroeventsph</strong> to see our latest work and get inspired!
        </p>
        <p style="color:#C9A84C;font-weight:600;margin-top:24px;">Creating memories, one event at a time. ✨</p>
      `),
    });
  }

  async notifyNewOrderRequest(req: OrderRequest): Promise<void> {
    const internalEmail = this.config.get('MAIL_USER');
    await this.send({
      to: internalEmail,
      subject: `📬 New Inquiry: ${req.fullName} — ${req.packagePreference} package`,
      html: this.wrap('New Order Request', `
        <h2 style="color:#C9A84C;margin-top:0;">New Booking Inquiry 📬</h2>
        <div style="background:#0D1117;border-radius:10px;padding:20px 24px;margin:20px 0;">
          <p><strong>Name:</strong> ${req.fullName}</p>
          <p><strong>Email:</strong> ${req.email}</p>
          <p><strong>Phone:</strong> ${req.phone}</p>
          <p><strong>Event Date:</strong> ${req.eventDate}</p>
          <p><strong>Package:</strong> ${req.packagePreference}</p>
          <p><strong>Event Type:</strong> ${req.eventType ?? 'Not specified'}</p>
          <p><strong>Guest Count:</strong> ${req.guestCount ?? 'Not specified'}</p>
          ${req.message ? `<p><strong>Message:</strong><br/>${req.message}</p>` : ''}
        </div>
        <p style="color:#8B9AB5;font-size:13px;">Submitted at ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} PHT</p>
        <div style="text-align:center;margin:20px 0;">
          <a href="${this.config.get('FRONTEND_URL')}/admin/order-requests" style="background:#C9A84C;color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;display:inline-block;">
            View in Dashboard →
          </a>
        </div>
      `),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  PAYMENT REMINDER EMAIL
  // ─────────────────────────────────────────────────────────────────────────────

  async sendPaymentReminder(
    to: string,
    clientName: string,
    eventTitle: string,
    amount: number,
    dueDate: string,
  ): Promise<void> {
    const firstName = clientName.split(' ')[0];
    const formatted = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    await this.send({
      to,
      subject: `💳 Payment Reminder — ${eventTitle}`,
      html: this.wrap('Payment Reminder', `
        <h2 style="color:#C9A84C;margin-top:0;">Hi ${firstName}! 👋</h2>
        <p>This is a friendly reminder that a payment is due for your upcoming event.</p>
        <div style="background:#0D1117;border-radius:10px;padding:20px 24px;margin:20px 0;border-left:3px solid #EAB308;">
          <p style="margin:0;color:#F0F0F0;"><strong>Event:</strong> ${eventTitle}</p>
          <p style="margin:6px 0 0;color:#F0F0F0;"><strong>Amount Due:</strong> <span style="color:#C9A84C;font-size:18px;font-weight:700;">${formatted}</span></p>
          <p style="margin:6px 0 0;color:#F0F0F0;"><strong>Due Date:</strong> ${dueDate}</p>
        </div>
        <p>Please settle this payment at your earliest convenience to keep your booking on track. You can pay via GCash, bank transfer, or cash at our office.</p>
        <p style="color:#8B9AB5;font-size:13px;">If you have already sent payment, please ignore this reminder or reply with your proof of payment reference number.</p>
        <p>For questions, contact us at <strong style="color:#C9A84C;">+63 912 345 6789</strong> or reply to this email.</p>
      `),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  //  FEEDBACK REQUEST EMAIL
  // ─────────────────────────────────────────────────────────────────────────────

  async sendFeedbackRequest(
    to: string,
    clientName: string,
    eventTitle: string,
  ): Promise<void> {
    const firstName = clientName.split(' ')[0];
    const url = `${this.config.get('FRONTEND_URL')}/portal`;
    await this.send({
      to,
      subject: `⭐ How was your ${eventTitle}? Share your experience!`,
      html: this.wrap('Share Your Experience', `
        <h2 style="color:#C9A84C;margin-top:0;">Kamusta ang event, ${firstName}? 🎉</h2>
        <p>
          It was our absolute honour to be part of your <strong>${eventTitle}</strong>. 
          We hope everything was beautiful and that you and your guests had an amazing time!
        </p>
        <p>
          If you have a moment, we'd love to hear about your experience. Your feedback helps us 
          improve and helps other families discover Metro Events.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${url}" style="background:#C9A84C;color:#fff;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;text-decoration:none;display:inline-block;">
            ⭐ Leave a Review
          </a>
        </div>
        <p style="color:#8B9AB5;font-size:13px;">
          It only takes 2 minutes and means the world to our team.
          Maraming salamat sa tiwala ninyo sa Metro Events! 💛
        </p>
      `),
    });
  }
}
</parameter>

<creaoArtifact identifier="mail-module" type="application/code" language="typescript" title="mail/mail.module.ts" path="files/metro-events-v2/backend/src/modules/mail/mail.module.ts">
import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

@Global()   // makes MailService available everywhere without re-importing MailModule
@Module({
  providers: [MailService],
  exports:   [MailService],
})
export class MailModule {}
</parameter>

Now the crown jewel — the complete Taglish templates service and reminders module:

<creaoArtifact identifier="taglish-templates" type="application/code" language="typescript" title="reminders/taglish-templates.service.ts" path="files/metro-events-v2/backend/src/modules/reminders/taglish-templates.service.ts">
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Event } from '../events/event.entity';
import { format, parseISO } from 'date-fns';

// ─────────────────────────────────────────────────────────────────────────────
//  TEMPLATE DEFINITIONS
//  Each template has:
//    id          – stable slug used as reference from the frontend
//    name        – display label
//    channel     – primary channel this template is written for
//    description – when to use it
//    placeholders – list of {{TOKENS}} the template uses
//    subject     – email subject (optional — not used for WhatsApp/SMS)
//    body        – the Taglish message body with {{PLACEHOLDER}} tokens
// ─────────────────────────────────────────────────────────────────────────────

export interface TemplateDefinition {
  id: string;
  name: string;
  channel: 'whatsapp' | 'email' | 'sms' | 'any';
  description: string;
  placeholders: string[];
  subject?: string;
  body: string;
}

export interface FilledTemplate {
  templateId: string;
  templateName: string;
  channel: string;
  subject?: string;
  body: string;
  whatsappUrl: string;
  emailUrl: string;
}

// ─────────────────────────────────────────────────────────────────────────────
//  ALL 7 OFFICIAL TAGLISH TEMPLATES  (from the MetroEvents docs)
//  + 3 bonus templates added for v2
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES: TemplateDefinition[] = [

  // ── 1. New Inquiry Auto-Reply ─────────────────────────────────────────────
  {
    id: 'new-inquiry',
    name: 'New Inquiry Auto-Reply',
    channel: 'any',
    description: 'First response to a new inquiry. Send within 1 hour of receiving the lead.',
    placeholders: ['CLIENT_FIRST_NAME', 'PACKAGE_NAME', 'EVENT_DATE'],
    subject: '🎉 Natanggap namin ang inyong inquiry — Metro Events',
    body: `Hi {{CLIENT_FIRST_NAME}}! 🌟

Salamat sa pag-reach out sa Metro Events! Natanggap namin ang inyong inquiry at sobrang excited kaming marinig pa ang tungkol sa inyong espesyal na okasyon.

Napansin namin na interested kayo sa aming **{{PACKAGE_NAME}} package** para sa {{EVENT_DATE}}. Great choice! 🎊

Ang susunod na hakbang ay mag-schedule ng isang ocular visit o online consultation para mas madetalye nating pag-usapan ang inyong vision para sa event.

Pwede po kayong mag-reply dito or tumawag sa amin sa **+63 912 345 6789** para ma-set ang appointment.

Abangan namin ang inyong reply! 💛

— Metro Events Team
*Creating memories, one event at a time.*`,
  },

  // ── 2. Ocular Schedule Confirmation ──────────────────────────────────────
  {
    id: 'ocular-confirmation',
    name: 'Ocular Schedule Confirmation',
    channel: 'any',
    description: 'Confirm an ocular / consultation appointment with the client.',
    placeholders: ['CLIENT_FIRST_NAME', 'OCULAR_DATE', 'OCULAR_TIME', 'LOCATION'],
    subject: '📅 Confirmed: Inyong Ocular Visit — Metro Events',
    body: `Hi {{CLIENT_FIRST_NAME}}! 😊

Confirmed na ang inyong ocular visit sa Metro Events! Here are the details:

📅 **Petsa:** {{OCULAR_DATE}}
⏰ **Oras:** {{OCULAR_TIME}}
📍 **Location:** {{LOCATION}}

Para sa meeting na ito, pwede kayong magdala ng:
• Pinterest boards o inspo photos na gusto ninyo
• Guest list estimate
• Budget range na comfortable para sa inyo

Kung may tanong kayo o kailangan ninyong i-reschedule, i-message lang kami agad. 🙏

Looking forward to meeting you, {{CLIENT_FIRST_NAME}}!

— Metro Events Team
📞 +63 912 345 6789`,
  },

  // ── 3. Proposal Sent Follow-up ────────────────────────────────────────────
  {
    id: 'proposal-sent',
    name: 'Proposal Sent Follow-up',
    channel: 'any',
    description: 'Send after the quote has been emailed to the client.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_TITLE', 'GRAND_TOTAL', 'QUOTE_EXPIRY_DATE', 'PORTAL_LINK'],
    subject: '📋 Inyong Metro Events Proposal — {{EVENT_TITLE}}',
    body: `Hi {{CLIENT_FIRST_NAME}}! 🌸

Just sent na ang inyong proposal para sa **{{EVENT_TITLE}}**! 📄

Makikita ninyo ang detalye ng quote sa inyong client portal:
🔗 {{PORTAL_LINK}}

**Total Package Value:** {{GRAND_TOTAL}}
**Proposal Valid Until:** {{QUOTE_EXPIRY_DATE}}

Sa portal, makikita ninyo ang:
✅ Complete line items at itemized breakdown
✅ Payment schedule (downpayment at balance)
✅ Terms and conditions
✅ Digital approval button

Kung may mga katanungan kayo tungkol sa proposal, huwag mag-alinlangan na mag-reply dito o tumawag sa amin. We're here to help! 😊

Maraming salamat at sana ay makasama kami sa inyong espesyal na araw. 💛

— {{COORDINATOR_NAME}}
Metro Events Coordinator
📞 +63 912 345 6789`,
  },

  // ── 4. Follow-up (No Response) ────────────────────────────────────────────
  {
    id: 'follow-up-no-response',
    name: 'Follow-up (No Response)',
    channel: 'any',
    description: 'Chase a client who has gone quiet after receiving a proposal.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_DATE', 'DAYS_SINCE_LAST_CONTACT'],
    subject: '👋 Checking in — Metro Events',
    body: `Hi {{CLIENT_FIRST_NAME}}! 😊

Kumusta kayo? Just checking in regarding your inquiry with Metro Events.

Nakita namin na may event kayo sa **{{EVENT_DATE}}** at gusto lang naming malaman kung mayroon kayong katanungan tungkol sa aming proposal o sa aming mga serbisyo.

Alam naming busy ang bawat isa sa atin, so no pressure! 🙏 Pero gusto lang naming ipaalala na ang mga available dates ay mabilis na nabe-book ngayong season, lalo na para sa inyong event date.

Kung handa na kayong magpatuloy o may gusto kayong i-clarify — kahit maliit na tanong lang — mag-reply lang kayo dito at tutulungan namin kayo agad.

Sana makasama kami sa paglikha ng magandang alaala para sa inyo! 💛

— Metro Events Team
📞 +63 912 345 6789 | hello@metroevents.ph`,
  },

  // ── 5. Balance Due Reminder ───────────────────────────────────────────────
  {
    id: 'balance-due',
    name: 'Balance Due Reminder',
    channel: 'any',
    description: 'Friendly nudge for an upcoming or overdue balance payment.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_TITLE', 'EVENT_DATE', 'BALANCE_AMOUNT', 'DUE_DATE', 'DAYS_UNTIL_DUE'],
    subject: '💳 Payment Reminder — {{EVENT_TITLE}}',
    body: `Hi {{CLIENT_FIRST_NAME}}! 👋

Friendly reminder lang po — may balance kayo para sa inyong {{EVENT_TITLE}}! 🎊

💰 **Balance Due:** {{BALANCE_AMOUNT}}
📅 **Due Date:** {{DUE_DATE}} ({{DAYS_UNTIL_DUE}} days na lang!)
🎉 **Event Date:** {{EVENT_DATE}}

Para sa payment, maaari kayong mag-bayad sa:
• **GCash:** 0912 345 6789 (Metro Events)
• **BPI:** Account # 1234-5678-90 (Metro Events Inc.)
• **Cash:** Sa aming opisina (may resibo)

Pagkatapos mag-bayad, paki-send lang ng proof of payment dito or sa aming email at ide-decode namin agad ang inyong receipt. ✅

Kung mayroon kayong concern sa payment — please let us know agad para makahanap tayo ng solusyon together. 🙏

Kaunti na lang at magiging ganap na ang inyong event! So excited para sa inyo! 💛

— {{COORDINATOR_NAME}}
Metro Events
📞 +63 912 345 6789`,
  },

  // ── 6. Fully Booked Confirmation ──────────────────────────────────────────
  {
    id: 'fully-booked',
    name: 'Fully Booked Confirmation',
    channel: 'any',
    description: 'Celebratory message confirming the booking is locked in after downpayment.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_TITLE', 'EVENT_DATE', 'VENUE', 'COORDINATOR_NAME'],
    subject: '🎊 Confirmed & Locked In — {{EVENT_TITLE}}!',
    body: `Hi {{CLIENT_FIRST_NAME}}! 🎊🎉

IT'S OFFICIAL! Fully booked na ang inyong event sa Metro Events! 🥳

Napakaraming salamat sa inyong tiwala sa amin. We are SO excited to be part of your **{{EVENT_TITLE}}**!

Here's a quick recap ng inyong booking:
📅 **Event Date:** {{EVENT_DATE}}
📍 **Venue:** {{VENUE}}
👤 **Your Coordinator:** {{COORDINATOR_NAME}}

**Anong mangyayari ngayon:**
1️⃣ Makikipag-ugnayan sa inyo ang inyong dedicated coordinator para sa initial planning meeting
2️⃣ Bibigyan namin kayo ng access sa inyong client portal para masubaybayan ang progress
3️⃣ Magsisimula na kaming mag-curate ng moodboard ideas para sa inyo

Huwag mag-atubiling mag-message anytime kung may katanungan kayo. Your coordinator is always just a message away! 💛

Again — CONGRATULATIONS at super hyped kami para sa inyong espesyal na araw! ✨

— Metro Events Family 💛
📞 +63 912 345 6789 | hello@metroevents.ph`,
  },

  // ── 7. Post-Event Feedback Request ────────────────────────────────────────
  {
    id: 'post-event-feedback',
    name: 'Post-Event Feedback Request',
    channel: 'any',
    description: 'Sent 1–3 days after the event to request a review.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_TITLE', 'PORTAL_LINK'],
    subject: '⭐ Kamusta ang event? — Metro Events loves to hear from you!',
    body: `Hi {{CLIENT_FIRST_NAME}}! 🌸

Kamusta kayo after the big day? We hope you and your guests had the most amazing time at **{{EVENT_TITLE}}**! 🎉

Isa sa mga pinaka-importante sa amin ay ang matutunan kung paano pa kami makapagbibigay ng mas magandang serbisyo — at ang inyong feedback ay napakahalaga para sa amin.

Kung mayroon kayong isang minuto, would you be willing to leave us a short review?

🔗 **Leave your review here:** {{PORTAL_LINK}}

It only takes 2 minutes and means the world to our entire team! 💛

At kung may naging hindi magandang karanasan sa kahit anong aspeto ng inyong event — please let us know agad. We take all feedback seriously and we'd love the chance to make it right.

Muli, maraming maraming salamat sa tiwala ninyo sa Metro Events. Napakaswerte namin na naging bahagi ng inyong espesyal na araw. 🥹

Hanggang sa susunod na selebrasyon! ✨

— {{COORDINATOR_NAME}} at ang buong Metro Events Team
📞 +63 912 345 6789`,
  },

  // ── 8. (BONUS) Ocular No-Show ─────────────────────────────────────────────
  {
    id: 'ocular-no-show',
    name: 'Ocular No-Show Follow-up',
    channel: 'any',
    description: 'Sent when a client misses a scheduled consultation without notice.',
    placeholders: ['CLIENT_FIRST_NAME', 'ORIGINAL_DATE', 'COORDINATOR_NAME'],
    subject: '📅 Nami-miss kita! — Let\'s reschedule your Metro Events consultation',
    body: `Hi {{CLIENT_FIRST_NAME}}! 😊

Napansin namin na hindi kayo nakarating sa aming appointment noong **{{ORIGINAL_DATE}}**. No worries at all — buhay nga naman, minsan may mga hindi inaasahang nangyayari! 🙏

Gusto lang naming tiyaking okay kayo at kung available pa rin kayong makipagusap tungkol sa inyong event.

Kung gusto ninyong mag-reschedule, reply lang kayo dito at hahanapin namin ang pinaka-convenient na araw at oras para sa inyo.

Nandito lang kami kapag handa na kayo! 💛

— {{COORDINATOR_NAME}}
Metro Events
📞 +63 912 345 6789`,
  },

  // ── 9. (BONUS) Design Approval Request ───────────────────────────────────
  {
    id: 'design-approval',
    name: 'Design / Moodboard Approval Request',
    channel: 'any',
    description: 'Notify client that design pegs are ready for review in the portal.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_TITLE', 'PORTAL_LINK', 'APPROVAL_DEADLINE'],
    subject: '🎨 Your moodboard is ready for review — {{EVENT_TITLE}}',
    body: `Hi {{CLIENT_FIRST_NAME}}! 🎨

Exciting news! Na-upload na ng aming design team ang mga pinakabagong moodboard pegs para sa inyong **{{EVENT_TITLE}}**!

Punta na sa inyong client portal para makita at i-approve ang mga designs:
🔗 {{PORTAL_LINK}}

Sa portal, makikita ninyo:
🌸 Color palette proposals
🌺 Floral arrangement concepts
✨ Backdrop and stage design ideas
🕯️ Table setting and lighting inspiration

**Deadline ng approval:** {{APPROVAL_DEADLINE}}

Kung may gusto kayong baguhin o idagdag — i-comment lang sa portal o mag-reply dito at ipapadala namin sa design team agad.

Can't wait to bring your vision to life! 💛

— Metro Events Design Team
📞 +63 912 345 6789`,
  },

  // ── 10. (BONUS) Event Day Reminder ───────────────────────────────────────
  {
    id: 'event-day-reminder',
    name: 'Event Day Reminder (Day Before)',
    channel: 'any',
    description: 'Final reminder sent the day before the event.',
    placeholders: ['CLIENT_FIRST_NAME', 'EVENT_TITLE', 'EVENT_DATE', 'SETUP_TIME', 'VENUE', 'COORDINATOR_NAME', 'COORDINATOR_PHONE'],
    subject: '🎊 Bukas na ang inyong big day! — Final Reminders',
    body: `Hi {{CLIENT_FIRST_NAME}}! 🎊🎉

BUKAS NA! Kaunti na lang at magiging katotohanan na ang lahat ng aming pinaghandaan! ✨

Here are your final reminders para sa {{EVENT_TITLE}}:

📅 **Event Date:** {{EVENT_DATE}}
📍 **Venue:** {{VENUE}}
⏰ **Setup Starts:** {{SETUP_TIME}}

**Inyong dedicated coordinator bukas:**
👤 {{COORDINATOR_NAME}}
📱 {{COORDINATOR_PHONE}} (direct line, available 24/7 bukas)

**Handa na ang aming team para sa:**
✅ Full venue setup and styling
✅ Supplier coordination
✅ Timeline management throughout the day
✅ Real-time coordination with your entourage

Ang kailangan ninyong gawin ay — mag-enjoy lang! Halos lahat ng detalye ay nasa amin na. 🙌

Kung may last-minute questions kayo, i-message lang si {{COORDINATOR_NAME}} directly.

SOBRANG EXCITED KAMING LAHAT para sa inyo bukas! 🥳💛

— Metro Events Team ✨
*Ngayong gabi, matulog na ng maaga!* 😴`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SERVICE
// ─────────────────────────────────────────────────────────────────────────────
@Injectable()
export class TaglishTemplatesService {
  constructor(
    @InjectRepository(Client)
    private clientRepo: Repository<Client>,

    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
  ) {}

  /** Return all template definitions (no data filled) */
  getAllTemplates(): Omit<TemplateDefinition, 'body'>[] {
    return TEMPLATES.map(({ body: _body, ...rest }) => rest);
  }

  /** Return one template definition */
  getTemplate(id: string): TemplateDefinition {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (!tpl) throw new NotFoundException(`Template "${id}" not found`);
    return tpl;
  }

  /**
   * Fill a template with real client + event data.
   *
   * Any placeholder that cannot be resolved from the DB is left as
   * {{PLACEHOLDER}} so the coordinator can fill it manually.
   */
  async fillTemplate(
    templateId: string,
    clientId: string,
    eventId?: string,
    overrides?: Record<string, string>,
  ): Promise<FilledTemplate> {
    const template = this.getTemplate(templateId);

    // ── Load data ────────────────────────────────────────────────────────────
    const client = await this.clientRepo.findOne({ where: { id: clientId }, relations: ['events'] });
    if (!client) throw new NotFoundException('Client not found');

    let event: Event | null = null;
    if (eventId) {
      event = await this.eventRepo.findOne({ where: { id: eventId }, relations: ['client'] });
    } else if (client.events?.length) {
      // Fall back to most recent event
      event = client.events.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
    }

    // ── Build token map ──────────────────────────────────────────────────────
    const firstName = client.fullName.split(' ')[0];
    const now = new Date();

    const formatPHP = (amount: number) =>
      new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);

    const formatDate = (d: string | Date | null | undefined) => {
      if (!d) return '(date TBD)';
      try {
        const parsed = typeof d === 'string' ? parseISO(d) : d;
        return format(parsed, 'MMMM d, yyyy');
      } catch {
        return String(d);
      }
    };

    const balance = event
      ? Number(event.totalAmount) - Number(event.totalPaid)
      : 0;

    const daysUntilEvent = event?.eventDate
      ? Math.ceil(
          (new Date(event.eventDate).getTime() - now.getTime()) / 86_400_000,
        )
      : null;

    // Default due date = 7 days from now
    const defaultDueDate = format(
      new Date(now.getTime() + 7 * 86_400_000),
      'MMMM d, yyyy',
    );

    const tokens: Record<string, string> = {
      CLIENT_FIRST_NAME:     firstName,
      CLIENT_FULL_NAME:      client.fullName,
      CLIENT_EMAIL:          client.email,
      CLIENT_PHONE:          client.phone ?? '(no phone on file)',
      EVENT_TITLE:           event?.title ?? '(event title TBD)',
      EVENT_DATE:            event?.eventDate ? formatDate(event.eventDate) : '(event date TBD)',
      EVENT_TYPE:            event?.type ?? 'event',
      VENUE:                 event?.venue ?? '(venue TBD)',
      PACKAGE_NAME:          event?.packageName ?? 'selected package',
      GRAND_TOTAL:           event ? formatPHP(Number(event.totalAmount)) : '(amount TBD)',
      TOTAL_PAID:            event ? formatPHP(Number(event.totalPaid)) : '₱0.00',
      BALANCE_AMOUNT:        event ? formatPHP(balance) : '(balance TBD)',
      DAYS_UNTIL_DUE:        '7',
      DUE_DATE:              defaultDueDate,
      OCULAR_DATE:           client.ocularDate ? formatDate(client.ocularDate) : '(date TBD)',
      OCULAR_TIME:           '10:00 AM',
      LOCATION:              'Metro Events Office, BGC, Taguig',
      ORIGINAL_DATE:         client.ocularDate ? formatDate(client.ocularDate) : '(date TBD)',
      DAYS_SINCE_LAST_CONTACT: client.lastContactedAt
        ? String(Math.ceil((now.getTime() - new Date(client.lastContactedAt).getTime()) / 86_400_000))
        : 'several',
      SETUP_TIME:            '7:00 AM',
      COORDINATOR_NAME:      'Your Metro Events Coordinator',
      COORDINATOR_PHONE:     '+63 912 345 6789',
      PORTAL_LINK:           `${process.env.FRONTEND_URL ?? 'https://metroevents.ph'}/portal`,
      QUOTE_EXPIRY_DATE:     format(new Date(now.getTime() + 14 * 86_400_000), 'MMMM d, yyyy'),
      APPROVAL_DEADLINE:     format(new Date(now.getTime() + 3 * 86_400_000), 'MMMM d, yyyy'),
      DAYS_UNTIL_EVENT:      daysUntilEvent != null ? String(daysUntilEvent) : 'TBD',
      ...overrides,
    };

    // ── Substitute all {{TOKEN}} occurrences ─────────────────────────────────
    const filled = template.body.replace(
      /\{\{([A-Z_]+)\}\}/g,
      (_, key: string) => tokens[key] ?? `{{${key}}}`,
    );

    const filledSubject = template.subject
      ? template.subject.replace(
          /\{\{([A-Z_]+)\}\}/g,
          (_, key: string) => tokens[key] ?? `{{${key}}}`,
        )
      : undefined;

    // ── Build share URLs ─────────────────────────────────────────────────────
    const encodedBody = encodeURIComponent(filled);
    const phone = client.phone?.replace(/\D/g, '').replace(/^0/, '63') ?? '';

    return {
      templateId: template.id,
      templateName: template.name,
      channel: template.channel,
      subject: filledSubject,
      body: filled,
      whatsappUrl: phone
        ? `https://wa.me/${phone}?text=${encodedBody}`
        : `https://wa.me/?text=${encodedBody}`,
      emailUrl: `mailto:${client.email}?subject=${encodeURIComponent(filledSubject ?? template.name)}&body=${encodedBody}`,
    };
  }
}
</parameter>

<creaoArtifact identifier="reminders-service" type="application/code" language="typescript" title="reminders/reminders.service.ts" path="files/metro-events-v2/backend/src/modules/reminders/reminders.service.ts">
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, In } from 'typeorm';
import { addDays, startOfDay, endOfDay, format } from 'date-fns';
import { Event, EventStatus } from '../events/event.entity';
import { Payment, PaymentStatus } from '../payments/payment.entity';
import { Client, CRMStage } from '../clients/client.entity';
import { PurchaseOrder, POStatus } from '../suppliers/supplier.entity';

export interface ReminderPayload {
  upcomingEvents:    UpcomingEventReminder[];
  overduePayments:   OverduePaymentReminder[];
  paymentsDueSoon:   PaymentDueSoonReminder[];
  supplierDeliveries: SupplierDeliveryReminder[];
  staleClients:      StaleClientReminder[];
  generatedAt:       string;
}

interface UpcomingEventReminder {
  eventId:    string;
  title:      string;
  clientName: string;
  eventDate:  string;
  daysAway:   number;
  status:     string;
  venue:      string | null;
}

interface OverduePaymentReminder {
  paymentId:  string;
  eventId:    string;
  eventTitle: string;
  clientName: string;
  amount:     number;
  dueDate:    string;
  daysOverdue: number;
  type:       string;
}

interface PaymentDueSoonReminder {
  paymentId:  string;
  eventId:    string;
  eventTitle: string;
  clientName: string;
  amount:     number;
  dueDate:    string;
  daysUntil:  number;
  type:       string;
}

interface SupplierDeliveryReminder {
  poId:          string;
  poNumber:      string;
  supplierName:  string;
  eventId:       string | null;
  description:   string;
  deliveryDate:  string;
  timeWindow:    string | null;
  amount:        number;
}

interface StaleClientReminder {
  clientId:        string;
  fullName:        string;
  email:           string;
  phone:           string | null;
  stage:           string;
  daysSinceContact: number;
  lastContactedAt:  string | null;
}

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Event)   private eventRepo:   Repository<Event>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Client)  private clientRepo:  Repository<Client>,
    @InjectRepository(PurchaseOrder) private poRepo: Repository<PurchaseOrder>,
  ) {}

  async getAll(): Promise<ReminderPayload> {
    const [
      upcomingEvents,
      overduePayments,
      paymentsDueSoon,
      supplierDeliveries,
      staleClients,
    ] = await Promise.all([
      this.getUpcomingEvents(),
      this.getOverduePayments(),
      this.getPaymentsDueSoon(),
      this.getSupplierDeliveries(),
      this.getStaleClients(),
    ]);

    return {
      upcomingEvents,
      overduePayments,
      paymentsDueSoon,
      supplierDeliveries,
      staleClients,
      generatedAt: new Date().toISOString(),
    };
  }

  // ── Events in the next 7 days ─────────────────────────────────────────────
  private async getUpcomingEvents(): Promise<UpcomingEventReminder[]> {
    const today   = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const in7days = format(endOfDay(addDays(new Date(), 7)), 'yyyy-MM-dd');

    const events = await this.eventRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.client', 'c')
      .where('e.eventDate BETWEEN :today AND :in7days', { today, in7days })
      .andWhere('e.status NOT IN (:...excluded)', {
        excluded: [EventStatus.DONE, EventStatus.CANCELLED],
      })
      .orderBy('e.eventDate', 'ASC')
      .getMany();

    const now = new Date();
    return events.map((e) => ({
      eventId:    e.id,
      title:      e.title,
      clientName: e.client?.fullName ?? '—',
      eventDate:  e.eventDate,
      daysAway:   Math.ceil(
        (new Date(e.eventDate).getTime() - now.getTime()) / 86_400_000,
      ),
      status: e.status,
      venue:  e.venue ?? null,
    }));
  }

  // ── Overdue payments ──────────────────────────────────────────────────────
  private async getOverduePayments(): Promise<OverduePaymentReminder[]> {
    const today = format(new Date(), 'yyyy-MM-dd');

    const payments = await this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.event', 'e')
      .leftJoinAndSelect('e.client', 'c')
      .where('p.status IN (:...statuses)', {
        statuses: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
      })
      .andWhere('p.dueDate < :today', { today })
      .orderBy('p.dueDate', 'ASC')
      .getMany();

    const now = new Date();
    return payments.map((p) => ({
      paymentId:   p.id,
      eventId:     p.eventId,
      eventTitle:  p.event?.title ?? '—',
      clientName:  (p.event as any)?.client?.fullName ?? '—',
      amount:      Number(p.amount),
      dueDate:     p.dueDate!,
      daysOverdue: Math.ceil(
        (now.getTime() - new Date(p.dueDate!).getTime()) / 86_400_000,
      ),
      type: p.type,
    }));
  }

  // ── Payments due within 3 days ────────────────────────────────────────────
  private async getPaymentsDueSoon(): Promise<PaymentDueSoonReminder[]> {
    const today   = format(new Date(), 'yyyy-MM-dd');
    const in3days = format(addDays(new Date(), 3), 'yyyy-MM-dd');

    const payments = await this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.event', 'e')
      .leftJoinAndSelect('e.client', 'c')
      .where('p.status IN (:...statuses)', {
        statuses: [PaymentStatus.PENDING, PaymentStatus.PARTIAL],
      })
      .andWhere('p.dueDate BETWEEN :today AND :in3days', { today, in3days })
      .orderBy('p.dueDate', 'ASC')
      .getMany();

    const now = new Date();
    return payments.map((p) => ({
      paymentId:  p.id,
      eventId:    p.eventId,
      eventTitle: p.event?.title ?? '—',
      clientName: (p.event as any)?.client?.fullName ?? '—',
      amount:     Number(p.amount),
      dueDate:    p.dueDate!,
      daysUntil:  Math.ceil(
        (new Date(p.dueDate!).getTime() - now.getTime()) / 86_400_000,
      ),
      type: p.type,
    }));
  }

  // ── Supplier deliveries today or tomorrow ─────────────────────────────────
  private async getSupplierDeliveries(): Promise<SupplierDeliveryReminder[]> {
    const today    = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const pos = await this.poRepo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.supplier', 's')
      .where('po.deliveryDate IN (:...dates)', { dates: [today, tomorrow] })
      .andWhere('po.status NOT IN (:...excluded)', {
        excluded: [POStatus.DELIVERED, POStatus.CANCELLED],
      })
      .orderBy('po.deliveryDate', 'ASC')
      .getMany();

    return pos.map((po) => ({
      poId:          po.id,
      poNumber:      po.poNumber,
      supplierName:  po.supplier?.companyName ?? '—',
      eventId:       po.eventId ?? null,
      description:   po.description ?? '—',
      deliveryDate:  po.deliveryDate!,
      timeWindow:    po.deliveryTimeWindow ?? null,
      amount:        Number(po.amount),
    }));
  }

  // ── Stale clients: Proposal Sent, no contact in 7+ days ──────────────────
  private async getStaleClients(): Promise<StaleClientReminder[]> {
    const staleThreshold = addDays(new Date(), -7);

    const clients = await this.clientRepo
      .createQueryBuilder('c')
      .where('c.stage = :stage', { stage: CRMStage.PROPOSAL_SENT })
      .andWhere(
        '(c.lastContactedAt IS NULL OR c.lastContactedAt < :threshold)',
        { threshold: staleThreshold },
      )
      .orderBy('c.lastContactedAt', 'ASC', 'NULLS FIRST')
      .getMany();

    const now = new Date();
    return clients.map((c) => ({
      clientId:         c.id,
      fullName:         c.fullName,
      email:            c.email,
      phone:            c.phone ?? null,
      stage:            c.stage,
      daysSinceContact: c.lastContactedAt
        ? Math.ceil(
            (now.getTime() - new Date(c.lastContactedAt).getTime()) / 86_400_000,
          )
        : 999,
      lastContactedAt: c.lastContactedAt?.toISOString() ?? null,
    }));
  }
}
</parameter>

<creaoArtifact identifier="reminders-controller" type="application/code" language="typescript" title="reminders/reminders.controller.ts" path="files/metro-events-v2/backend/src/modules/reminders/reminders.controller.ts">
import {
  Controller, Get, Post, Body, Param, Query, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { TaglishTemplatesService } from './taglish-templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';

// ─── DTOs ─────────────────────────────────────────────────────────────────────
import {
  IsString, IsNotEmpty, IsOptional, IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FillTemplateDto {
  @ApiProperty({ example: 'balance-due', description: 'Template ID slug' })
  @IsString()
  @IsNotEmpty()
  templateId: string;

  @ApiProperty({ description: 'UUID of the client to fill placeholders from' })
  @IsUUID()
  clientId: string;

  @ApiPropertyOptional({ description: 'UUID of a specific event (optional — defaults to most recent)' })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({
    description: 'Key-value overrides for any placeholder token',
    example: { COORDINATOR_NAME: 'Ate Jess', SETUP_TIME: '8:00 AM' },
  })
  @IsOptional()
  overrides?: Record<string, string>;
}

// ─────────────────────────────────────────────────────────────────────────────
@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reminders')
export class RemindersController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly templatesService: TaglishTemplatesService,
  ) {}

  // ── Smart Reminders Dashboard ─────────────────────────────────────────────

  @Get()
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({
    summary: 'Get all smart reminders',
    description:
      'Returns upcoming events (7 days), overdue payments, payments due in 3 days, supplier deliveries today/tomorrow, and stale CRM clients.',
  })
  getAll() {
    return this.remindersService.getAll();
  }

  // ── Taglish Templates ─────────────────────────────────────────────────────

  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({
    summary: 'List all Taglish message templates',
    description:
      'Returns all 10 template definitions (id, name, channel, description, placeholders). Does not include the body text.',
  })
  listTemplates() {
    return this.templatesService.getAllTemplates();
  }

  @Get('templates/:id')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({
    summary: 'Get a single template definition with body text',
    description: 'Useful for previewing the raw template before filling.',
  })
  getTemplate(@Param('id') id: string) {
    return this.templatesService.getTemplate(id);
  }

  @Post('fill-template')
  @Roles(UserRole.ADMIN, UserRole.COORDINATOR)
  @ApiOperation({
    summary: 'Fill a Taglish template with real client/event data',
    description:
      'Substitutes all {{PLACEHOLDER}} tokens with data from the DB. Returns the filled message body, a WhatsApp deep-link URL, and a mailto URL.',
  })
  fillTemplate(@Body() dto: FillTemplateDto) {
    return this.templatesService.fillTemplate(
      dto.templateId,
      dto.clientId,
      dto.eventId,
      dto.overrides,
    );
  }
}
</parameter>

<creaoArtifact identifier="reminders-module" type="application/code" language="typescript" title="reminders/reminders.module.ts" path="files/metro-events-v2/backend/src/modules/reminders/reminders.module.ts">
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { TaglishTemplatesService } from './taglish-templates.service';
import { Event } from '../events/event.entity';
import { Payment } from '../payments/payment.entity';
import { Client } from '../clients/client.entity';
import { PurchaseOrder } from '../suppliers/supplier.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Payment, Client, PurchaseOrder]),
  ],
  controllers: [RemindersController],
  providers: [RemindersService, TaglishTemplatesService],
  exports: [RemindersService, TaglishTemplatesService],
})
export class RemindersModule {}
</parameter>

Now write the database seed file — creates the admin and seeds 2 sample reviews: