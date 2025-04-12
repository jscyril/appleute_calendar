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
    this.clearNotification(event.id);

    const now = new Date();
    const notificationTime = new Date(event.notificationTime);

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

    const newNotificationTime = new Date();
    newNotificationTime.setMinutes(
      newNotificationTime.getMinutes() + snoozeMinutes,
    );

    const updatedEvent = await this.eventsService.update(eventId, {
      notificationTime: newNotificationTime,
      isSnoozed: true,
    });

    this.scheduleNotification(updatedEvent);

    return updatedEvent;
  }

  private async sendNotification(event: Event) {
    this.notificationQueue.delete(event.id);

    this.notificationGateway.sendNotification(event);
  }

  async initializeNotifications() {
    const events = await this.eventsService.findAll();
    events.forEach((event) => {
      if (!event.isSnoozed) {
        this.scheduleNotification(event);
      }
    });
  }
}
