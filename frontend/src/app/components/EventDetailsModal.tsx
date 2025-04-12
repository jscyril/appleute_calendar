"use client";
import { Event } from "@/services/eventService";
import { API_CONFIG } from "@/config/api";
import { notificationService } from "@/services/notificationService";
import { useState } from "react";

const getFullUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${API_CONFIG.baseUrl}${path}`;
};

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
  event: Event;
}

export default function EventDetailsModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  event,
}: EventDetailsModalProps) {
  const [isSnoozing, setIsSnoozing] = useState(false);
  const [snoozeMinutes, setSnoozeMinutes] = useState(5);

  const handleSnooze = async () => {
    try {
      setIsSnoozing(true);
      await notificationService.snoozeEvent(event.id, snoozeMinutes);
      onClose();
    } catch (error) {
      console.error("Failed to snooze event:", error);
      alert("Failed to snooze event. Please try again.");
    } finally {
      setIsSnoozing(false);
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md relative my-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-5">{event.title}</h2>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <h3 className="font-medium text-gray-700">Description</h3>
            <p className="mt-1 text-gray-600">{event.description}</p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">Start Time</h3>
            <p className="mt-1 text-gray-600">
              {new Date(event.startDate).toLocaleString()}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-700">End Time</h3>
            <p className="mt-1 text-gray-600">
              {new Date(event.endDate).toLocaleString()}
            </p>
          </div>

          {event.images && event.images.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Images</h3>
              <div className="grid grid-cols-2 gap-2">
                {event.images.map((img, index) => (
                  <img
                    key={index}
                    src={getFullUrl(img)}
                    alt={`Event image ${index + 1}`}
                    className="w-full rounded-md hover:opacity-90 cursor-pointer"
                    onClick={() => window.open(getFullUrl(img), "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          {event.videos && event.videos.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Videos</h3>
              <div className="grid grid-cols-1 gap-2">
                {event.videos.map((video, index) => (
                  <video
                    key={index}
                    src={getFullUrl(video)}
                    controls
                    className="w-full rounded-md"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
              <select
                value={snoozeMinutes}
                onChange={(e) => setSnoozeMinutes(Number(e.target.value))}
                className="
                  px-3 
                  py-2 
                  border-2 
                  border-gray-600 
                  rounded-md 
                  focus:outline-none 
                  focus:border-blue-500 
                  focus:ring-2 
                  focus:ring-blue-500
                  bg-white
                  text-gray-900
                "
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
              </select>
              <button
                onClick={handleSnooze}
                disabled={isSnoozing}
                className="
                  px-4 
                  py-2 
                  bg-blue-500 
                  text-white 
                  rounded-md 
                  hover:bg-blue-600
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                "
              >
                {isSnoozing ? "Snoozing..." : "Snooze"}
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(event)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this event?"
                    )
                  ) {
                    onDelete(event.id);
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
