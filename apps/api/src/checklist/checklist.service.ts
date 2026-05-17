// apps/api/src/checklist/checklist.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CHECKLIST_TEMPLATES } from '../../packages/utils'; // or inline

const TEMPLATES: Record<string, any[]> = {
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
    { phase: 'load_in', title: 'Truck loading checklist signed off', responsibleRole: 'warehouse' },
    { phase: 'load_in', title: 'Delivery to venue on time', responsibleRole: 'warehouse' },
    { phase: 'load_in', title: 'Setup complete before deadline', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Team briefing at call time', responsibleRole: 'coordinator' },
    { phase: 'event_day', title: 'Client walkthrough and sign-off', responsibleRole: 'coordinator' },
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
    { phase: 'supplier', title: 'Confirm AV / LED wall supplier', responsibleRole: 'coordinator' },
    { phase: 'supplier', title: 'Confirm catering', responsibleRole: 'coordinator' },
    { phase: 'load_in', title: 'All props and materials delivered', responsibleRole: 'warehouse' },
    { phase: 'event_day', title: 'AV dry run / sound check', responsibleRole: 'coordinator' },
    { phase: 'load_out', title: 'All items returned to truck', responsibleRole: 'warehouse' },
    { phase: 'post_event', title: 'Issue final invoice', responsibleRole: 'coordinator' },
  ],
  birthday: [
    { phase: 'pre_production', title: 'Theme and color palette confirmed', responsibleRole: 'designer' },
    { phase: 'pre_production', title: 'Guest count finalized', responsibleRole: 'coordinator' },
    { phase: 'fabrication', title: 'Balloon arrangements prepared', responsibleRole: 'designer' },
    { phase: 'supplier', title: 'Confirm cake supplier', responsibleRole: 'coordinator' },
    { phase: 'load_in', title: 'Setup complete 1 hour before event', responsibleRole: 'coordinator' },
    { phase: 'load_out', title: 'All rented items retrieved', responsibleRole: 'warehouse' },
    { phase: 'post_event', title: 'Balance collected', responsibleRole: 'coordinator' },
  ],
};

@Injectable()
export class ChecklistService {
  constructor(private prisma: PrismaService) {}

  async findByEvent(eventId: string) {
    return this.prisma.checklistItem.findMany({
      where: { eventId },
      orderBy: [{ phase: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async create(data: any) {
    const count = await this.prisma.checklistItem.count({ where: { eventId: data.eventId } });
    return this.prisma.checklistItem.create({ data: { ...data, sortOrder: count } });
  }

  async update(id: string, data: any) {
    return this.prisma.checklistItem.update({ where: { id }, data });
  }

  async toggle(id: string, doneByName?: string) {
    const item = await this.prisma.checklistItem.findUniqueOrThrow({ where: { id } });
    return this.prisma.checklistItem.update({
      where: { id },
      data: {
        isDone: !item.isDone,
        doneAt: !item.isDone ? new Date() : null,
        doneByName: !item.isDone ? doneByName : null,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.checklistItem.delete({ where: { id } });
  }

  async applyTemplate(eventId: string, templateKey: string) {
    const template = TEMPLATES[templateKey] ?? TEMPLATES.wedding;
    await this.prisma.checklistItem.deleteMany({ where: { eventId } });
    return this.prisma.checklistItem.createMany({
      data: template.map((item, i) => ({ ...item, eventId, sortOrder: i })),
    });
  }

  async getProgress(eventId: string) {
    const [total, done] = await Promise.all([
      this.prisma.checklistItem.count({ where: { eventId } }),
      this.prisma.checklistItem.count({ where: { eventId, isDone: true } }),
    ]);
    return { total, done, percent: total ? Math.round((done / total) * 100) : 0 };
  }
}
