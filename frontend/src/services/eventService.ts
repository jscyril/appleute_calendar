import { API_CONFIG } from "../config/api";

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  notificationTime: Date;
  images?: string[];
  videos?: string[];
  isSnoozed: boolean;
}

export const eventService = {
  async uploadFiles(files: File[]): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await fetch(`${API_CONFIG.baseUrl}/events/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload files");
    const data = await response.json();
    return data.urls;
  },

  async getAllEvents(): Promise<Event[]> {
    const response = await fetch(`${API_CONFIG.baseUrl}/events`);
    if (!response.ok) throw new Error("Failed to fetch events");
    return response.json();
  },

  async createEvent(
    eventData: Omit<Event, "id" | "isSnoozed">
  ): Promise<Event> {
    const response = await fetch(`${API_CONFIG.baseUrl}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error("Failed to create event");
    return response.json();
  },

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    const response = await fetch(`${API_CONFIG.baseUrl}/events/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventData),
    });
    if (!response.ok) throw new Error("Failed to update event");
    return response.json();
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_CONFIG.baseUrl}/events/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete event");
  },
};
