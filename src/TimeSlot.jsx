import React from "react";

const TimeSlotList = ({ timeSlots }) => {
  return (
    <ul>
      {timeSlots.map((slot, index) => (
        <li key={index} style={{ fontWeight: slot.isEvent ? "bold" : "normal" }}>
          {slot.time} {slot.isEvent && "(Event)"}
        </li>
      ))}
    </ul>
  );
};

// Example usage
const events = [
  {
    time: "10:30",
    relatedEvents: [{ timeRange: "12:00 - 13:00" }],
  },
  {
    time: "14:00",
    relatedEvents: [{ timeRange: "15:30 - 16:00" }],
  },
];

const generateTimeSlots = (events) => {
  if (!events.length) return [];

  // Initialize a Set to store unique event times
  const eventTimesSet = new Set();

  // Collect event times and related event times
  events.forEach((event) => {
    eventTimesSet.add(event.time); // Add main event time

    if (event.relatedEvents) {
      event.relatedEvents.forEach((relatedEvent) => {
        const relatedEventTime = relatedEvent.timeRange.split("-")[0].trim();
        eventTimesSet.add(relatedEventTime); // Add related event time
      });
    }
  });

  // Generate default time slots from 10:00 AM to 10:00 PM
  const timeSlots = [];
  for (let hour = 10; hour <= 22; hour++) {
    const timeString = `${hour.toString().padStart(2, "0")}:00`;
    timeSlots.push({
      time: timeString,
      isEvent: eventTimesSet.has(timeString), // Mark if this time has an event
    });
  }

  return timeSlots;
};



export default TimeSlotList;
