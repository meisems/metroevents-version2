import { Module } from '@nestjs/common';
import { AfterEventsService } from './after-events.service';
import { AfterEventsController } from './after-events.controller';
@Module({ providers: [AfterEventsService], controllers: [AfterEventsController] })
export class AfterEventsModule {}
