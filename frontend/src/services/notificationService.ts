import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "../config/api";
import { eventService } from "./eventService";

class NotificationService {
  private socket: Socket | null = null;
  private notificationPermission: NotificationPermission = "default";

  async init() {
    console.log("Initializing notification service...");

    // Request notification permission
    if ("Notification" in window) {
      this.notificationPermission = await Notification.requestPermission();
      console.log("Notification permission:", this.notificationPermission);
    } else {
      console.warn("Notifications not supported in this browser");
    }

    // Connect to WebSocket
    console.log("Connecting to WebSocket at:", API_CONFIG.baseUrl);
    this.socket = io(API_CONFIG.baseUrl);

    this.socket.on("connect", () => {
      console.log("WebSocket connected successfully");
    });

    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    this.socket.on("notification", async (data) => {
      console.log("Received notification:", data);

      // Show browser notification if permission granted
      if (this.notificationPermission === "granted") {
        const notification = new Notification(data.title, {
          body: data.description,
          icon: "/calendar-icon.png", // Make sure to add this icon to your public folder
          tag: data.id,
          requireInteraction: true,
        });

        notification.onclick = async () => {
          // Focus on the calendar tab or open a new one
          window.focus();
          notification.close();

          // Navigate to the event details
          window.dispatchEvent(
            new CustomEvent("openEventDetails", { detail: data })
          );
        };
      }

      // Show custom popup
      window.dispatchEvent(
        new CustomEvent("showNotification", { detail: data })
      );
    });
  }

  async snoozeEvent(eventId: string, minutes: number = 5) {
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/events/${eventId}/snooze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ minutes }),
        }
      );

      if (!response.ok) throw new Error("Failed to snooze event");

      // Refresh events in the calendar
      await eventService.getAllEvents();
    } catch (error) {
      console.error("Failed to snooze event:", error);
      throw error;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const notificationService = new NotificationService();
