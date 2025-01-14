import React from "react";

const MonthView = ({ currentMonth, events, onEventClick }) => {
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const formatDateForCompare = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  const renderEvent = (dayDate) => {
    const dayEvents = events.filter(
      (event) =>
        formatDateForCompare(event.date) === formatDateForCompare(dayDate)
    );

    if (dayEvents.length === 0) return null;

    const mainEvent = dayEvents[0];
    const totalEvents =
      dayEvents.length +
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
            Interviewer: {mainEvent.interviewer}
            <br />
            Time: {mainEvent.timeRange}
          </div>
        </div>
      </div>
    );
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    days.push(
      <div key={day} className="calendar-day">
        <div className="day-number">{day}</div>
        {renderEvent(date)}
      </div>
    );
  }

  return (
    <div className="month-view">
      <div className="calendar-grid">
        <div className="weekday-header">Sun</div>
        <div className="weekday-header">Mon</div>
        <div className="weekday-header">Tue</div>
        <div className="weekday-header">Wed</div>
        <div className="weekday-header">Thu</div>
        <div className="weekday-header">Fri</div>
        <div className="weekday-header">Sat</div>
        {days}
      </div>
    </div>
  );
};

export default MonthView;
