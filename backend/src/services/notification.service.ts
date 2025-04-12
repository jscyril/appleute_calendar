import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Event } from '../events/entities/event.entity';
import { EventsService } from '../events/events.service';
import { NotificationGateway } from '../gateways/notification.gateway';

@Injectable()
export class NotificationService {
  private notificationQueue: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  scheduleNotification(event: Event) {
    // Clear existing notification if any
    this.clearNotification(event.id);

    const now = new Date();
    const notificationTime = new Date(event.notificationTime);

    // If notification time is in the future, schedule it
    if (notificationTime > now) {
      const timeoutId = setTimeout(() => {
        this.sendNotification(event);
      }, notificationTime.getTime() - now.getTime());

      this.notificationQueue.set(event.id, timeoutId);
    }
  }

  clearNotification(eventId: string) {
    const existingTimeout = this.notificationQueue.get(eventId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.notificationQueue.delete(eventId);
    }
  }

  async snoozeEvent(eventId: string, snoozeMinutes: number = 5) {
    const event = await this.eventsService.findOne(eventId);
    if (!event) return;

    // Update notification time
    const newNotificationTime = new Date();
    newNotificationTime.setMinutes(
      newNotificationTime.getMinutes() + snoozeMinutes,
    );

    // Update event
    const updatedEvent = await this.eventsService.update(eventId, {
      notificationTime: newNotificationTime,
      isSnoozed: true,
    });

    // Reschedule notification
    this.scheduleNotification(updatedEvent);

    return updatedEvent;
  }

  private async sendNotification(event: Event) {
    // Remove from queue
    this.notificationQueue.delete(event.id);

    // Send notification through WebSocket
    this.notificationGateway.sendNotification(event);
  }

  // Call this when the application starts
  async initializeNotifications() {
    const events = await this.eventsService.findAll();
    events.forEach((event) => {
      if (!event.isSnoozed) {
        this.scheduleNotification(event);
      }
    });
  }
}
