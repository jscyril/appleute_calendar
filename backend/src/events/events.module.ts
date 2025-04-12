import { Module, forwardRef } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { FileUploadModule } from '../services/file-upload.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [FileUploadModule, forwardRef(() => NotificationsModule)],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
