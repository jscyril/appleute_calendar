import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { Event } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private notificationQueue: Map<string, NodeJS.Timeout> = new Map();
  private readonly MAX_TIMEOUT = 2147483647;

  constructor(
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  scheduleNotification(event: Event) {
    this.logger.log(`Scheduling notification for event: ${event.id}`);

    this.clearNotification(event.id);

    const now = new Date();
    const notificationTime = new Date(event.notificationTime);

    this.logger.log(`Event details:`, {
      eventId: event.id,
      title: event.title,
      startDate: new Date(event.startDate).toISOString(),
      endDate: new Date(event.endDate).toISOString(),
      notificationTime: notificationTime.toISOString(),
      currentTime: now.toISOString(),
    });

    const delay = notificationTime.getTime() - now.getTime();

    if (delay > 0) {
      this.logger.log(
        `Scheduling notification in ${delay}ms (${Math.round(delay / 1000 / 60)} minutes)`,
      );

      if (delay > this.MAX_TIMEOUT) {
        const timeoutId = setTimeout(() => {
          this.logger.log(
            `Rescheduling long notification for event: ${event.id}`,
          );
          this.scheduleNotification(event);
        }, this.MAX_TIMEOUT);

        this.notificationQueue.set(event.id, timeoutId);
      } else {
        const timeoutId = setTimeout(() => {
          this.sendNotification(event);
        }, delay);

        this.notificationQueue.set(event.id, timeoutId);
      }
    } else {
      this.logger.warn(`Cannot schedule notification - time is in the past:`, {
        eventId: event.id,
        title: event.title,
        delay: `${Math.round(delay / 1000 / 60)} minutes`,
        notificationTime: notificationTime.toISOString(),
        currentTime: now.toISOString(),
      });
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

    const newNotificationTime = new Date();
    newNotificationTime.setMinutes(
      newNotificationTime.getMinutes() + snoozeMinutes,
    );

    const newEndDate = new Date(event.endDate);
    newEndDate.setMinutes(newEndDate.getMinutes() + snoozeMinutes);

    const updatedEvent = await this.eventsService.update(eventId, {
      notificationTime: newNotificationTime,
      endDate: newEndDate,
      isSnoozed: true,
    });

    this.scheduleNotification(updatedEvent);

    return updatedEvent;
  }

  private async sendNotification(event: Event) {
    this.logger.log(`Sending notification for event: ${event.id}`);

    const now = new Date();
    const notificationTime = new Date(event.notificationTime);

    if (notificationTime > now) {
      this.logger.warn(`Notification triggered too early, rescheduling:`, {
        eventId: event.id,
        title: event.title,
        notificationTime: notificationTime.toISOString(),
        currentTime: now.toISOString(),
      });
      this.scheduleNotification(event);
      return;
    }

    this.notificationQueue.delete(event.id);
    this.notificationGateway.sendNotification(event);
  }

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
