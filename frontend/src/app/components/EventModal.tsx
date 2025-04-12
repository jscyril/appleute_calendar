"use client";
import { useState, useEffect } from "react";
import { eventService } from "@/services/eventService";
import { API_CONFIG } from "@/config/api";

const toLocalDateTimeString = (date: Date | string): string => {
  try {
    const dateObject = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObject.getTime())) {
      console.error("Invalid date:", date);
      return "";
    }

    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    const hours = String(dateObject.getHours()).padStart(2, "0");
    const minutes = String(dateObject.getMinutes()).padStart(2, "0");

    console.log("Converting date:", {
      original: date,
      formatted: `${year}-${month}-${day}T${hours}:${minutes}`,
      components: { year, month, day, hours, minutes },
    });

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

const getFullUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  return `${API_CONFIG.baseUrl}${path}`;
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
    startDate: Date | string;
    endDate: Date | string;
    notificationTime: Date | string;
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

  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [notificationTime, setNotificationTime] = useState("");

  const [notificationPreset, setNotificationPreset] = useState("5min");

  useEffect(() => {
    if (editMode && eventToEdit) {
      setEventStartDate(toLocalDateTimeString(eventToEdit.startDate));
      setEventEndDate(toLocalDateTimeString(eventToEdit.endDate));
      setNotificationTime(toLocalDateTimeString(eventToEdit.notificationTime));
    } else {
      setEventStartDate(toLocalDateTimeString(startDate));
      setEventEndDate(toLocalDateTimeString(endDate));
      const notifTime = new Date(endDate);
      notifTime.setMinutes(notifTime.getMinutes() - 5);
      setNotificationTime(toLocalDateTimeString(notifTime));
    }
  }, [editMode, eventToEdit, startDate, endDate]);

  const [images, setImages] = useState<string[]>(
    editMode && eventToEdit?.images ? eventToEdit.images : []
  );
  const [videos, setVideos] = useState<string[]>(
    editMode && eventToEdit?.videos ? eventToEdit.videos : []
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const uploadedUrls = await eventService.uploadFiles(Array.from(files));
        setImages((prev) => [...prev, ...uploadedUrls]);
      } catch (error) {
        console.error("Failed to upload images:", error);
        alert("Failed to upload images. Please try again.");
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      try {
        const uploadedUrls = await eventService.uploadFiles(Array.from(files));
        setVideos((prev) => [...prev, ...uploadedUrls]);
      } catch (error) {
        console.error("Failed to upload videos:", error);
        alert("Failed to upload videos. Please try again.");
      }
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleDeleteVideo = (indexToDelete: number) => {
    setVideos((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const handleNotificationPresetChange = (preset: string) => {
    setNotificationPreset(preset);
    const end = new Date(eventEndDate);
    let notifTime = new Date(end);

    switch (preset) {
      case "atEnd":
        notifTime = new Date(end);
        break;
      case "5min":
        notifTime.setMinutes(end.getMinutes() - 5);
        break;
      case "15min":
        notifTime.setMinutes(end.getMinutes() - 15);
        break;
      case "30min":
        notifTime.setMinutes(end.getMinutes() - 30);
        break;
      case "1hour":
        notifTime.setHours(end.getHours() - 1);
        break;
      case "custom":
        return;
    }
    setNotificationTime(toLocalDateTimeString(notifTime));
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
          className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 pl-1"
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
              Notify me
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleNotificationPresetChange("atEnd")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    notificationPreset === "atEnd"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  When event ends
                </button>
                <button
                  type="button"
                  onClick={() => handleNotificationPresetChange("5min")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    notificationPreset === "5min"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  5 min before end
                </button>
                <button
                  type="button"
                  onClick={() => handleNotificationPresetChange("15min")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    notificationPreset === "15min"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  15 min before end
                </button>
                <button
                  type="button"
                  onClick={() => handleNotificationPresetChange("30min")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    notificationPreset === "30min"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  30 min before end
                </button>
                <button
                  type="button"
                  onClick={() => handleNotificationPresetChange("custom")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    notificationPreset === "custom"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Custom time
                </button>
              </div>
              <input
                type="datetime-local"
                value={notificationTime}
                onChange={(e) => {
                  setNotificationTime(e.target.value);
                  setNotificationPreset("custom");
                }}
                className="w-full px-3 py-2 border-2 border-gray-600 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                required
              />
            </div>
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
                  <div key={index} className="relative group">
                    <img
                      src={getFullUrl(img)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-20 object-cover rounded-md hover:opacity-90"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(index)}
                      className="
                        absolute top-1 right-1
                        bg-red-500 text-white
                        rounded-full p-1
                        opacity-0 group-hover:opacity-100
                        transition-opacity
                        hover:bg-red-600
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-500
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
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
                  <div key={index} className="relative group">
                    <video
                      src={getFullUrl(video)}
                      controls
                      className="w-full rounded-md hover:opacity-90"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(index)}
                      className="
                        absolute top-1 right-1
                        bg-red-500 text-white
                        rounded-full p-1
                        opacity-0 group-hover:opacity-100
                        transition-opacity
                        hover:bg-red-600
                        focus:outline-none
                        focus:ring-2
                        focus:ring-red-500
                      "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
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
