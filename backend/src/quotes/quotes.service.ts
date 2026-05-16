import {
  Injectable, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote, QuoteLineItem } from './quote.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote) private quoteRepo: Repository<Quote>,
    @InjectRepository(QuoteLineItem) private lineRepo: Repository<QuoteLineItem>,
  ) {}

  async findByEvent(eventId: string): Promise<Quote[]> {
    return this.quoteRepo.find({
      where: { eventId },
      relations: ['lineItems'],
      order: { version: 'DESC' },
    });
  }

  async findActive(eventId: string): Promise<Quote | null> {
    return this.quoteRepo.findOne({
      where: { eventId, isActive: true },
      relations: ['lineItems'],
    });
  }

  async findOne(id: string): Promise<Quote> {
    const q = await this.quoteRepo.findOne({ where: { id }, relations: ['lineItems'] });
    if (!q) throw new NotFoundException('Quote not found');
    return q;
  }

  async create(dto: CreateQuoteDto): Promise<Quote> {
    // Deactivate existing active quote for this event
    await this.quoteRepo.update({ eventId: dto.eventId, isActive: true }, { isActive: false });

    // Get next version number
    const count = await this.quoteRepo.countBy({ eventId: dto.eventId });

    const quote = this.quoteRepo.create({
      ...dto,
      version: count + 1,
      isActive: true,
      lineItems: [],
    });

    // Calculate totals
    const savedQuote = await this.quoteRepo.save(quote);
    if (dto.lineItems?.length) {
      const items = dto.lineItems.map((item, i) =>
        this.lineRepo.create({ ...item, quoteId: savedQuote.id, sortOrder: i }),
      );
      await this.lineRepo.save(items);
    }

    return this.recalculate(savedQuote.id);
  }

  async approveByClient(id: string, clientName: string): Promise<Quote> {
    const quote = await this.findOne(id);
    if (!quote.isActive) throw new BadRequestException('Only the active quote can be approved');
    quote.isApprovedByClient = true;
    quote.approvedByClientAt = new Date();
    quote.approvedByClientName = clientName;
    return this.quoteRepo.save(quote);
  }

  private async recalculate(id: string): Promise<Quote> {
    const quote = await this.findOne(id);
    const subtotal = quote.lineItems.reduce(
      (sum, item) => sum + Number(item.unitPrice) * item.quantity,
      0,
    );

    let discount = 0;
    if (quote.discountType === 'percentage') {
      discount = subtotal * (Number(quote.discountValue) / 100);
    } else {
      discount = Number(quote.discountValue);
    }

    const taxAmount = (subtotal - discount) * (Number(quote.taxPercent) / 100);
    quote.subtotal  = subtotal;
    quote.grandTotal = subtotal - discount + taxAmount;

    return this.quoteRepo.save(quote);
  }
}
