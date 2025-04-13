import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
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
    const event: Event = {
      id: uuid4(),
      ...createEventDto,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      notificationTime: new Date(createEventDto.notificationTime),
      isSnoozed: false,
    };

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
    if (eventIndex === -1) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    this.notificationService.clearNotification(id);

    const currentEvent = this.events[eventIndex];
    const updatedEvent = {
      ...currentEvent,
      ...updateEventDto,
      startDate: updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : currentEvent.startDate,
      endDate: updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : currentEvent.endDate,
      notificationTime: updateEventDto.notificationTime
        ? new Date(updateEventDto.notificationTime)
        : currentEvent.notificationTime,
    };

    this.events[eventIndex] = updatedEvent;

    this.notificationService.scheduleNotification(updatedEvent);

    return updatedEvent;
  }

  remove(id: string): void {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return;

    this.notificationService.clearNotification(id);

    this.events.splice(eventIndex, 1);
  }

  replace(id: string, createEventDto: CreateEventDto): Event {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) {
      throw new NotFoundException(`Event with ID "${id}" not found`);
    }

    this.notificationService.clearNotification(id);

    const replacementEvent: Event = {
      id,
      ...createEventDto,
      startDate: new Date(createEventDto.startDate),
      endDate: new Date(createEventDto.endDate),
      notificationTime: new Date(createEventDto.notificationTime),
      isSnoozed: false,
    };

    this.events[eventIndex] = replacementEvent;

    this.notificationService.scheduleNotification(replacementEvent);

    return replacementEvent;
  }
}
