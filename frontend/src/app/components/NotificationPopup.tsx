"use client";

import { useState, useEffect } from "react";
import { notificationService } from "@/services/notificationService";

interface NotificationData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export default function NotificationPopup() {
  const [notification, setNotification] = useState<NotificationData | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  useEffect(() => {
    const handleNotification = (data: NotificationData) => {
      setNotification(data);
      setIsVisible(true);
      setShowSnoozeOptions(false);
    };

    window.addEventListener("showNotification", ((
      e: CustomEvent<NotificationData>
    ) => {
      handleNotification(e.detail);
    }) as EventListener);

    return () => {
      window.removeEventListener("showNotification", ((
        e: CustomEvent<NotificationData>
      ) => {
        handleNotification(e.detail);
      }) as EventListener);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setNotification(null);
    setShowSnoozeOptions(false);
  };

  const handleSnooze = async (minutes: number) => {
    if (notification) {
      try {
        await notificationService.snoozeEvent(notification.id, minutes);
        setIsVisible(false);
        setNotification(null);
        setShowSnoozeOptions(false);
      } catch (error) {
        console.error("Failed to snooze event:", error);
      }
    }
  };

  const handleCustomSnooze = () => {
    const minutes = parseInt(customMinutes);
    if (!isNaN(minutes) && minutes > 0) {
      handleSnooze(minutes);
    }
  };

  if (!isVisible || !notification) return null;

  const startDate = new Date(notification.startDate);
  const endDate = new Date(notification.endDate);
  const now = new Date();
  const isStarting = startDate <= now && now <= endDate;
  const timeText = isStarting ? "is starting now" : "is about to start";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 w-80 border border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {notification.title}
          </h3>
          <button
            onClick={handleDismiss}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          {notification.description || "No description provided"}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          This event {timeText} ({startDate.toLocaleTimeString()} -{" "}
          {endDate.toLocaleTimeString()})
        </p>
        <div className="flex justify-between">
          <button
            onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
          >
            Snooze
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Dismiss
          </button>
        </div>

        {showSnoozeOptions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => handleSnooze(1)}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                +1 min
              </button>
              <button
                onClick={() => handleSnooze(2)}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                +2 min
              </button>
              <button
                onClick={() => handleSnooze(3)}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                +3 min
              </button>
              <button
                onClick={() => handleSnooze(5)}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                +5 min
              </button>
              <button
                onClick={() => handleSnooze(10)}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                +10 min
              </button>
              <button
                onClick={() => handleSnooze(15)}
                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 text-sm"
              >
                +15 min
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                placeholder="Custom minutes"
                className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={handleCustomSnooze}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
              >
                Set
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
