// apps/api/src/quotes/quotes.controller.ts
import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/index';
import { CurrentUser } from '../auth/decorators/index';

@ApiTags('Quotes')
@ApiBearerAuth()
@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('event/:eventId')
  findByEvent(@Param('eventId') eventId: string) {
    return this.quotesService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Get(':id/pdf')
  async generatePdf(@Param('id') id: string, @Res() res: Response) {
    // PDF generation would happen here using pdfkit
    const quote = await this.quotesService.generatePdfData(id);
    res.json({ message: 'PDF generation endpoint', quoteId: id });
  }

  @Post()
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  create(@Body() body: any) {
    return this.quotesService.create(body);
  }

  @Patch(':id')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.quotesService.update(id, body);
  }

  @Patch(':id/approve')
  @Roles('admin', 'coordinator', 'client')
  @UseGuards(RolesGuard)
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.quotesService.approve(id, user.name);
  }

  @Post(':id/items')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  addItem(@Param('id') id: string, @Body() body: any) {
    return this.quotesService.addItem(id, body);
  }

  @Patch('items/:itemId')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  updateItem(@Param('itemId') itemId: string, @Body() body: any) {
    return this.quotesService.updateItem(itemId, body);
  }

  @Delete('items/:itemId')
  @Roles('admin', 'coordinator')
  @UseGuards(RolesGuard)
  removeItem(@Param('itemId') itemId: string) {
    return this.quotesService.removeItem(itemId);
  }
}
