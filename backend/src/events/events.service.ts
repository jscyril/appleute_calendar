import { Injectable } from '@nestjs/common';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { v4 as uuid4 } from 'uuid';

@Injectable()
export class EventsService {
  private events: Event[] = [];

  create(createEventDto: CreateEventDto): Event {
    const event: Event = { id: uuid4(), ...createEventDto, isSnoozed: false };
    this.events.push(event);
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
    this.events[eventIndex] = {
      ...this.events[eventIndex],
      ...updateEventDto,
    };
    return this.events[eventIndex];
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
    this.events.splice(eventIndex, 1);
    return true;
  }
}
