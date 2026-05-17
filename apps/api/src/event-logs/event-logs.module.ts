import { Module } from '@nestjs/common';
import { EventLogsService } from './event-logs.service';
import { EventLogsController } from './event-logs.controller';
@Module({ providers: [EventLogsService], controllers: [EventLogsController] })
export class EventLogsModule {}
