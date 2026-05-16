import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistItem, ChecklistPhase } from './checklist.entity';

const WEDDING_TEMPLATE: Partial<ChecklistItem>[] = [
  { phase: ChecklistPhase.PRE_PRODUCTION, title: 'Confirm venue booking', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.PRE_PRODUCTION, title: 'Finalize guest list count', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.PRE_PRODUCTION, title: 'Approve moodboard with client', responsibleRole: 'designer' as any },
  { phase: ChecklistPhase.FABRICATION, title: 'Order florals from supplier', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.FABRICATION, title: 'Build backdrop frame', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.SUPPLIER, title: 'Confirm catering delivery time', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.LOAD_IN, title: 'Arrive at venue 4 hours early', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.LOAD_IN, title: 'Set up tables and linens', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.EVENT_DAY, title: 'Coordinate with client on arrival', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.LOAD_OUT, title: 'Pack all inventory items', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.POST_EVENT, title: 'Send thank-you message to client', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.POST_EVENT, title: 'Request feedback / review', responsibleRole: 'coordinator' as any },
];

const CORPORATE_TEMPLATE: Partial<ChecklistItem>[] = [
  { phase: ChecklistPhase.PRE_PRODUCTION, title: 'Confirm AV requirements', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.PRE_PRODUCTION, title: 'Approve branding elements', responsibleRole: 'designer' as any },
  { phase: ChecklistPhase.FABRICATION, title: 'Print and prepare signage', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.SUPPLIER, title: 'Confirm catering headcount', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.LOAD_IN, title: 'Set up registration area', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.EVENT_DAY, title: 'Brief all crew on program flow', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.LOAD_OUT, title: 'Collect all display materials', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.POST_EVENT, title: 'Send post-event report to client', responsibleRole: 'coordinator' as any },
];

const BIRTHDAY_TEMPLATE: Partial<ChecklistItem>[] = [
  { phase: ChecklistPhase.PRE_PRODUCTION, title: 'Confirm theme with client', responsibleRole: 'designer' as any },
  { phase: ChecklistPhase.FABRICATION, title: 'Prepare props and décor', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.SUPPLIER, title: 'Order cake from supplier', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.LOAD_IN, title: 'Set up photo booth area', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.EVENT_DAY, title: 'Coordinate program flow', responsibleRole: 'coordinator' as any },
  { phase: ChecklistPhase.LOAD_OUT, title: 'Return all rented items', responsibleRole: 'warehouse' as any },
  { phase: ChecklistPhase.POST_EVENT, title: 'Send photos to client', responsibleRole: 'designer' as any },
];

@Injectable()
export class ChecklistService {
  constructor(@InjectRepository(ChecklistItem) private repo: Repository<ChecklistItem>) {}

  findByEvent(eventId: string) {
    return this.repo.find({
      where: { eventId },
      order: { phase: 'ASC', sortOrder: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ChecklistItem> {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException('Checklist item not found');
    return item;
  }

  async create(dto: any): Promise<ChecklistItem> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: any): Promise<ChecklistItem> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async toggle(id: string, userId: string, userName: string): Promise<ChecklistItem> {
    const item = await this.findOne(id);
    item.isDone = !item.isDone;
    if (item.isDone) {
      item.checkedById = userId;
      item.checkedByName = userName;
      item.checkedAt = new Date();
    } else {
      item.checkedById = null;
      item.checkedByName = null;
      item.checkedAt = null;
    }
    return this.repo.save(item);
  }

  async loadTemplate(eventId: string, type: 'wedding' | 'corporate' | 'birthday'): Promise<ChecklistItem[]> {
    const templates = { wedding: WEDDING_TEMPLATE, corporate: CORPORATE_TEMPLATE, birthday: BIRTHDAY_TEMPLATE };
    const items = (templates[type] || WEDDING_TEMPLATE).map((t, i) =>
      this.repo.create({ ...t, eventId, sortOrder: i }),
    );
    return this.repo.save(items);
  }

  async remove(id: string): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }
}
