import React from "react";

// Helper function to parse a time string (e.g., "10 A.M" -> hours and minutes)
const parseTime = (time) => {
  if (!time) return null;

  let [hour, period] = time.split(" ");
  hour = parseInt(hour);

  if (period.toUpperCase() === "P.M" && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === "A.M" && hour === 12) {
    hour = 0;
  }

  return { hour, minute: 0 }; // Assuming all events start at the beginning of the hour
};

// Function to check if the time slot is within the event range
const isTimeInRange = (slotTime, eventStart, eventEnd) => {
  const slot = parseTime(slotTime);
  const start = parseTime(eventStart);
  const end = parseTime(eventEnd);

  if (!slot || !start || !end) return false;

  const slotInMinutes = slot.hour * 60 + slot.minute;
  const startInMinutes = start.hour * 60 + start.minute;
  const endInMinutes = end.hour * 60 + end.minute;

  return slotInMinutes >= startInMinutes && slotInMinutes < endInMinutes;
};

const DayView = ({ selectedDate, events, onEventClick }) => {
  // Generate time slots for the day (e.g., every hour from 9 AM to 6 PM)
  const generateTimeSlots = (start, end, interval) => {
    const slots = [];
    let currentTime = start;

    while (currentTime <= end) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const formattedTime = `${hours % 12 || 12}:${minutes
        .toString()
        .padStart(2, "0")} ${hours < 12 ? "A.M" : "P.M"}`;
      slots.push(formattedTime);
      currentTime += interval;
    }

    return slots;
  };

  // Track globally rendered events to avoid duplicates
  const renderedEventIds = new Set();

  // Render individual events for a given time slot
  const renderEventsForSlot = (time) => {
    const eventsForSlot = events.filter((event) => {
      if (!event.timeRange) return false;

      const [start, end] = event.timeRange.split(" - ");
      return isTimeInRange(time, start, end);
    });

    return eventsForSlot.map((event) => {
      if (renderedEventIds.has(event.id)) return null;

      renderedEventIds.add(event.id); // Mark as rendered
      const totalEvents = 1 + (event.relatedEvents ? event.relatedEvents.length : 0);

      return (
        <div
          key={event.id}
          className="event-card"
          onClick={(e) => onEventClick(event, e)}
          style={{ cursor: "pointer" }}
        >
          <div className="event-blue-line"></div>
          <div className="event-content">
            {totalEvents > 1 && <div className="event-count">{totalEvents}</div>}
            <div className="event-title">{event.title}</div>
            <div className="event-details">
              {event.round && <div>{event.round}</div>}
              <div>Interviewer: {event.interviewer}</div>
              <div>Time: {event.timeRange}</div>
            </div>
          </div>
        </div>
      );
    }).filter(Boolean); // Filter out null values
  };

  // Generate time slots from 9 AM to 6 PM (with 60-minute intervals)
  const timeSlots = generateTimeSlots(9 * 60, 18 * 60, 60);

  return (
    <div className="day-view">
      <div className="time-grid">
        <div className="time-column">
          {timeSlots.map((time) => (
            <div key={time} className="time-slot">
              {time}
            </div>
          ))}
        </div>
        <div className="events-column">
          {timeSlots.map((time) => (
            <div key={time} className="time-cell">
              {renderEventsForSlot(time)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayView;
