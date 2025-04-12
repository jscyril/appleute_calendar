import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { v4 as uuid4 } from 'uuid';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  create(createEventDto: CreateEventDto): Event {
    const event: Event = { id: uuid4(), ...createEventDto, isSnoozed: false };
    this.events.push(event);

    this.notificationService.scheduleNotification(event);

    return event;
  }

  findAll(): Event[] {
    return this.events;
  }

  findOne(id: string): Event {
    return this.events.find((event) => event.id === id);
  }

  update(id: string, updateEventDto: UpdateEventDto): Event {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return null;

    const updatedEvent = {
      ...this.events[eventIndex],
      ...updateEventDto,
    };
    this.events[eventIndex] = updatedEvent;

    if (updateEventDto.notificationTime || !updatedEvent.isSnoozed) {
      this.notificationService.scheduleNotification(updatedEvent);
    }

    return updatedEvent;
  }

  replace(id: string, createEventDto: CreateEventDto): Event {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return null;
    this.events[eventIndex] = {
      id,
      ...createEventDto,
      isSnoozed: false,
    };
    return this.events[eventIndex];
  }

  remove(id: string): boolean {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return false;

    this.notificationService.clearNotification(id);

    this.events.splice(eventIndex, 1);
    return true;
  }
}
