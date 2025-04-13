"use client";
import { FC, useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { Event, eventService } from "@/services/eventService";
import EventModal from "./EventModal";
import EventDetailsModal from "./EventDetailsModal";
import SearchBar from "./SearchBar";

type FilterOption =
  | "all"
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "withImages"
  | "withVideos";

const Calendar: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [filter, setFilter] = useState<FilterOption>("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, filter]);

  const filterEvents = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    let filtered = [...events];

    switch (filter) {
      case "today":
        filtered = events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate.toDateString() === now.toDateString();
        });
        break;
      case "thisWeek":
        filtered = events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= startOfWeek && eventDate <= endOfWeek;
        });
        break;
      case "thisMonth":
        filtered = events.filter((event) => {
          const eventDate = new Date(event.startDate);
          return eventDate >= startOfMonth && eventDate <= endOfMonth;
        });
        break;
      case "withImages":
        filtered = events.filter(
          (event) => event.images && event.images.length > 0
        );
        break;
      case "withVideos":
        filtered = events.filter(
          (event) => event.videos && event.videos.length > 0
        );
        break;
      default:
        break;
    }

    setFilteredEvents(filtered);
  };

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

  const handleDateClick = (arg: DateClickArg) => {
    const clickedDate = new Date(arg.date);
    const now = new Date();

    if (clickedDate.toDateString() === now.toDateString()) {
      clickedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    } else {
      clickedDate.setHours(9, 0, 0, 0);
    }

    const endTime = new Date(clickedDate.getTime() + 60 * 60 * 1000);

    setStartDate(clickedDate);
    setEndDate(endTime);

    setSelectedEvent({
      id: "",
      title: "",
      description: "",
      startDate: clickedDate,
      endDate: endTime,
      notificationTime: new Date(clickedDate.getTime() - 15 * 60 * 1000),
      images: [],
      videos: [],
      isSnoozed: false,
    });
    setShowModal(true);
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

  const handleSearchEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const calendarEvents: EventInput[] = filteredEvents.map((event) => ({
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
    <div className="h-screen flex flex-col bg-white">
      {error && <div className="text-red-500 px-4 py-2">{error}</div>}

      <div className="px-4 py-2 flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <SearchBar events={events} onEventClick={handleSearchEventClick} />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="filter" className="text-sm font-medium text-gray-700">
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white text-gray-900"
          >
            <option value="all">All Events</option>
            <option value="today">Today</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="withImages">With Images</option>
            <option value="withVideos">With Videos</option>
          </select>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4">
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
          dateClick={handleDateClick}
          height="100%"
          fixedWeekCount={false}
          dayHeaderFormat={{ weekday: "short" }}
          dayCellContent={(args) => {
            const date = args.date;
            const day = date.getDate();
            const isOtherMonth =
              date.getMonth() !== args.view.currentStart.getMonth();

            if (isOtherMonth) {
              const month = date.toLocaleString("default", { month: "short" });
              return {
                html: `<div class="text-gray-400">${month} ${day}</div>`,
              };
            }
            return { html: `<div>${day}</div>` };
          }}
        />
      </div>
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
