export class Event {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  images?: string[];
  videos?: string[];
  notificationTime: Date;
  isSnoozed: boolean = false;
}
