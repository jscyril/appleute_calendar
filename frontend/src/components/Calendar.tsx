"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from "@fullcalendar/core";

export default function Calendar() {
  const [showModal, setShowModal] = useState(false);
  const [selectedDates, setSelectedDates] = useState<{
    start: Date;
    end: Date;
  } | null>(null);

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectedDates({
      start: selectInfo.start,
      end: selectInfo.end,
    });
    setShowModal(true);
  };
  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log("Event clicked:", clickInfo.event);
  };
  return (
    <div className="h-screen p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev, next today",
          center: "title",
          right: "dayGridMonth, timeGridWeek, timeGridDay",
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEventRows={true}
        weekends={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        events={[]}
      />
      {showModal && (
        <div>
          <p>Modal</p>
          <button onClick={() => setShowModal(false)}>Close</button>
        </div>
      )}
    </div>
  );
}
