import React from "react";
import { addMonths, format } from "date-fns";

const YearView = ({ date, events, localizer }) => {
  const months = Array.from({ length: 12 }, (_, index) => {
    const monthDate = addMonths(new Date(date.getFullYear(), 0, 1), index);
    return {
      title: format(monthDate, "MMMM"),
      date: monthDate,
    };
  });

  // The `title` function is needed by react-big-calendar
  YearView.title = () => "Year View"; // Return a string representing the title of the view

  // Render events for the current month
  const renderMonthEvents = (monthDate) => {
    return events
      .filter(
        (event) =>
          new Date(event.start).getMonth() === monthDate.getMonth() &&
          new Date(event.start).getFullYear() === monthDate.getFullYear()
      )
      .map((event, idx) => (
        <div key={idx} className="event">
          <p>{event.title}</p>
          <p>{format(new Date(event.start), "dd MMM yyyy")}</p>
        </div>
      ));
  };

  return (
    <div className="year-view">
      {months.map((month, idx) => (
        <div className="month" key={idx}>
          <h3>{month.title}</h3>
          <div className="month-events">{renderMonthEvents(month.date)}</div>
        </div>
      ))}
    </div>
  );
};

export default YearView;
