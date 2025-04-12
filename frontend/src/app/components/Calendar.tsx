"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";
import EventModal from "./EventModal";
import { eventService, Event } from "@/services/eventService";

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await eventService.getAllEvents();
        setEvents(data);
      } catch (err: any) {
        setError(err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSubmit = async (eventData: {
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    notificationTime: Date;
    images?: string[];
    videos?: string[];
  }) => {
    try {
      const newEvent = await eventService.createEvent(eventData);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
      setShowModal(false);
    } catch (error: any) {
      setError(error?.message);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDates({ start: selectInfo.start, end: selectInfo.end });
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log("Event clicked:", clickInfo.event);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center h-screen">
        Error: {error}
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8">
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
        dayMaxEventRows={true}
        weekends={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={events.map((event) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.startDate),
          end: new Date(event.endDate),
          extendedProps: { description: event.description },
        }))}
        height="auto"
      />
      {showModal && selectedDates && (
        <EventModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          startDate={selectedDates.start}
          endDate={selectedDates.end}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
