import React from "react";

const DayView = ({ selectedDate, events, timeSlots, onEventClick }) => {
  const renderEvent = (time) => {
    const eventsForSlot = events.filter(e => e.time === time);

    if (eventsForSlot.length === 0) return null;

    const mainEvent = eventsForSlot[0];
    const totalEvents = eventsForSlot.length +
      (mainEvent.relatedEvents ? mainEvent.relatedEvents.length : 0);

    return (
      <div
        className="event-card"
        onClick={(e) => onEventClick(mainEvent, e)}
        style={{ cursor: "pointer" }}
      >
        <div className="event-blue-line"></div>
        <div className="event-content">
          {totalEvents > 1 && <div className="event-count">{totalEvents}</div>}
          <div className="event-title">{mainEvent.title}</div>
          <div className="event-details">
            {mainEvent.round && <div>{mainEvent.round}</div>}
            <div>Interviewer: {mainEvent.interviewer}</div>
            <div>Time: {mainEvent.timeRange}</div>
          </div>
        </div>
      </div>
    );
  };

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
              {renderEvent(time)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayView;
