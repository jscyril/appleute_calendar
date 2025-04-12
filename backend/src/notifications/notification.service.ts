import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { Event } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private notificationQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  scheduleNotification(event: Event) {
    this.logger.log(`Scheduling notification for event: ${event.id}`);

    // Clear existing notification if any
    this.clearNotification(event.id);

    const now = new Date();
    const notificationTime = new Date(event.notificationTime);

    this.logger.log(`Notification time: ${notificationTime.toISOString()}`);
    this.logger.log(`Current time: ${now.toISOString()}`);

    // If notification time is in the future, schedule it
    if (notificationTime > now) {
      const delay = notificationTime.getTime() - now.getTime();
      this.logger.log(`Scheduling notification in ${delay}ms`);

      const timeoutId = setTimeout(() => {
        this.sendNotification(event);
      }, delay);

      this.notificationQueue.set(event.id, timeoutId);
    } else {
      this.logger.warn(
        `Notification time is in the past for event: ${event.id}`,
      );
    }
  }

  clearNotification(eventId: string) {
    const existingTimeout = this.notificationQueue.get(eventId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.notificationQueue.delete(eventId);
      this.logger.log(`Cleared notification for event: ${eventId}`);
    }
  }

  async snoozeEvent(eventId: string, snoozeMinutes: number = 5) {
    this.logger.log(`Snoozing event ${eventId} for ${snoozeMinutes} minutes`);

    const event = await this.eventsService.findOne(eventId);
    if (!event) {
      this.logger.warn(`Event not found: ${eventId}`);
      return;
    }

    // Update notification time
    const newNotificationTime = new Date();
    newNotificationTime.setMinutes(
      newNotificationTime.getMinutes() + snoozeMinutes,
    );

    // Calculate new end time
    const newEndDate = new Date(event.endDate);
    newEndDate.setMinutes(newEndDate.getMinutes() + snoozeMinutes);

    // Update event
    const updatedEvent = await this.eventsService.update(eventId, {
      notificationTime: newNotificationTime,
      endDate: newEndDate,
      isSnoozed: true,
    });

    // Reschedule notification
    this.scheduleNotification(updatedEvent);

    return updatedEvent;
  }

  private async sendNotification(event: Event) {
    this.logger.log(`Sending notification for event: ${event.id}`);

    // Remove from queue
    this.notificationQueue.delete(event.id);

    // Send notification through WebSocket
    this.notificationGateway.sendNotification(event);
  }

  // Call this when the application starts
  async initializeNotifications() {
    this.logger.log('Initializing notifications...');
    const events = await this.eventsService.findAll();
    this.logger.log(`Found ${events.length} events to initialize`);

    events.forEach((event) => {
      if (!event.isSnoozed) {
        this.scheduleNotification(event);
      }
    });
  }
}
