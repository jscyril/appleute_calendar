"use client";
import { Event } from "@/services/eventService";

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
                    src={img}
                    alt={`Event image ${index + 1}`}
                    className="w-full rounded-md hover:opacity-90 cursor-pointer"
                    onClick={() => window.open(img, "_blank")}
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
                    src={video}
                    controls
                    className="w-full rounded-md"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={() => onEdit(event)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (
                window.confirm("Are you sure you want to delete this event?")
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
  );
}
