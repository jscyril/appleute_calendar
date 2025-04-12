"use client";
import { FC, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { Event, eventService } from "@/services/eventService";
import EventModal from "./EventModal";
import EventDetailsModal from "./EventDetailsModal";

const Calendar: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const fetchedEvents = await eventService.getAllEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while fetching events");
      }
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setShowModal(true);
    setStartDate(selectInfo.start);
    setEndDate(selectInfo.end);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const eventId = clickInfo.event.id;
    const event = events.find((e) => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowDetailsModal(true);
    }
  };

  const handleSubmit = async (eventData: Omit<Event, "id" | "isSnoozed">) => {
    try {
      if (isEditMode && selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, eventData);
      } else {
        await eventService.createEvent(eventData);
      }
      await fetchEvents();
      setShowModal(false);
      setIsEditMode(false);
      setSelectedEvent(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          `An error occurred while ${
            isEditMode ? "updating" : "creating"
          } the event`
        );
      }
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setShowDetailsModal(false);
    setShowModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await eventService.deleteEvent(eventId);
      await fetchEvents();
      setShowDetailsModal(false);
      setSelectedEvent(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred while deleting the event");
      }
    }
  };

  const calendarEvents: EventInput[] = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.startDate,
    end: event.endDate,
    extendedProps: {
      description: event.description,
      notificationTime: event.notificationTime,
      images: event.images,
      videos: event.videos,
      isSnoozed: event.isSnoozed,
    },
  }));

  return (
    <div className="h-screen p-4">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        events={calendarEvents}
        select={handleDateSelect}
        eventClick={handleEventClick}
        height="100%"
      />
      {showModal && (
        <EventModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setIsEditMode(false);
            setSelectedEvent(null);
          }}
          onSubmit={handleSubmit}
          startDate={startDate || new Date()}
          endDate={endDate || new Date()}
          editMode={isEditMode}
          eventToEdit={selectedEvent || undefined}
        />
      )}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          isOpen={showDetailsModal}
          event={selectedEvent}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default Calendar;
