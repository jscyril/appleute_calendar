"use client";
import { useState } from "react";

const toLocalDateTimeString = (date: Date): string => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: Date;
  endDate: Date;
  onSubmit: (eventData: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    notificationTime: Date;
    images?: string[];
    videos?: string[];
  }) => void;
  editMode?: boolean;
  eventToEdit?: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    notificationTime: Date;
    images?: string[];
    videos?: string[];
  };
}

export default function EventModal({
  isOpen,
  onClose,
  startDate,
  endDate,
  onSubmit,
  editMode = false,
  eventToEdit,
}: EventModalProps) {
  const [title, setTitle] = useState(
    editMode && eventToEdit ? eventToEdit.title : ""
  );
  const [description, setDescription] = useState(
    editMode && eventToEdit ? eventToEdit.description : ""
  );
  const [eventStartDate, setEventStartDate] = useState(
    editMode && eventToEdit
      ? toLocalDateTimeString(eventToEdit.startDate)
      : toLocalDateTimeString(startDate)
  );
  const [eventEndDate, setEventEndDate] = useState(
    editMode && eventToEdit
      ? toLocalDateTimeString(eventToEdit.endDate)
      : toLocalDateTimeString(endDate)
  );
  const [notificationTime, setNotificationTime] = useState(
    editMode && eventToEdit
      ? toLocalDateTimeString(eventToEdit.notificationTime)
      : toLocalDateTimeString(startDate)
  );
  const [images, setImages] = useState<string[]>(
    editMode && eventToEdit?.images ? eventToEdit.images : []
  );
  const [videos, setVideos] = useState<string[]>(
    editMode && eventToEdit?.videos ? eventToEdit.videos : []
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );

      Promise.all(newImages).then((uploadedImages) => {
        setImages((prev) => [...prev, ...uploadedImages]);
      });
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newVideos = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          })
      );

      Promise.all(newVideos).then((uploadedVideos) => {
        setVideos((prev) => [...prev, ...uploadedVideos]);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      startDate: new Date(eventStartDate),
      endDate: new Date(eventEndDate),
      notificationTime: new Date(notificationTime),
      images,
      videos,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md relative my-8 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-5 text-center">
          {editMode ? "Edit Event" : "Add New Event"}
        </h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
                w-full 
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="
                w-full 
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
                min-h-[100px]
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={eventStartDate}
              onChange={(e) => setEventStartDate(e.target.value)}
              className="
                w-full
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date &amp; Time
            </label>
            <input
              type="datetime-local"
              value={eventEndDate}
              onChange={(e) => setEventEndDate(e.target.value)}
              className="
                w-full 
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Time
            </label>
            <input
              type="datetime-local"
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
              className="
                w-full
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
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="
                w-full 
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
            />
            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-md hover:opacity-90"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Videos
            </label>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoUpload}
              className="
                w-full 
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
            />
            {videos.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {videos.map((video, index) => (
                  <video
                    key={index}
                    src={video}
                    controls
                    className="w-full rounded-md hover:opacity-90"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 
                py-2 
                border-2 
                border-gray-600 
                rounded-md 
                text-gray-700 
                hover:bg-gray-50 
                focus:outline-none 
                focus:ring-2 
                focus:ring-gray-500
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              className="
                px-4 
                py-2 
                bg-blue-500 
                text-white 
                rounded-md 
                hover:bg-blue-600 
                focus:outline-none 
                focus:ring-2 
                focus:ring-blue-500
              "
            >
              {editMode ? "Update Event" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
