import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { FileUploadModule } from '../services/file-upload.module';

@Module({
  imports: [FileUploadModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
