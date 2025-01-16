import React, { useState, useEffect, useCallback } from "react";
import DayView from "./DayView";
import MonthView from "./MonthView";
import "./MyCalendar.css";
import Gicon from "./google_meet_icon.png";

const MyCalendar = () => {
  const [currentView, setCurrentView] = useState("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [calendarData, setCalendarData] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [currentWeek, setCurrentWeek] = useState({
    weekNumber: "",
    dateRange: "",
    days: [],
  });
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const getWeekNumber = useCallback((date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }, []);

  const updateCurrentWeek = useCallback(
    (date) => {
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay() + 1);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const weekNumber = getWeekNumber(startOfWeek);

      const days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return {
          date: day.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
          }),
          day: day.toLocaleDateString("en-US", { weekday: "long" }),
          fullDate: day.toISOString().split("T")[0],
        };
      });

      const dateRange = `${startOfWeek.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })} to ${endOfWeek.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
      })}, ${startOfWeek.getFullYear()}`;

      setCurrentWeek({
        weekNumber: String(weekNumber).padStart(2, "0"),
        dateRange,
        days,
      });
    },
    [getWeekNumber]
  );

  const generateTimeSlots = (startTime = "09:00", endTime = "20:00") => {
    const slots = [];
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let currentTime = new Date();
    currentTime.setHours(startHours, startMinutes, 0, 0);

    const endTimeDate = new Date();
    endTimeDate.setHours(endHours, endMinutes, 0, 0);

    while (currentTime <= endTimeDate) {
      let hours = currentTime.getHours();
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const period = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12 || 12; // Convert to 12-hour format

      const timeSlot = `${hours}:${minutes} ${period}`;
      slots.push(timeSlot);

      currentTime.setHours(currentTime.getHours() + 1);
    }

    return slots;
  };

  useEffect(() => {
    const fetchAndMergeEvents = async () => {
      try {
        const [weekResponse, meetingResponse] = await Promise.all([
          fetch("/calendarfromtoenddate.json"),
          fetch("/calendar_meeting.json"),
        ]);

        const weekData = await weekResponse.json();
        const meetingData = await meetingResponse.json();

        const mergedData = [...weekData];

        meetingData.forEach((meeting) => {
          const isDuplicate = mergedData.some(
            (event) =>
              event.date === meeting.date &&
              event.time === meeting.time &&
              event.title === meeting.title
          );

          if (!isDuplicate) {
            mergedData.push(meeting);
          }
        });

        setCalendarData(mergedData);

        if (mergedData.length > 0) {
          const dates = mergedData.map((event) => new Date(event.date));
          const minDate = new Date(Math.min(...dates));
          setSelectedDate(minDate);
          updateCurrentWeek(minDate);
        }

        const allTimeSlots = generateTimeSlots();
        setTimeSlots(allTimeSlots);
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      }
    };

    fetchAndMergeEvents();
  }, [updateCurrentWeek]);

  useEffect(() => {
    updateCurrentWeek(selectedDate);
  }, [selectedDate, updateCurrentWeek]);

  const formatDateForCompare = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  const getEvents = () => {
    if (!calendarData) return [];
    return calendarData.map((event) => ({
      ...event,
      meetingLink: event.meetingLink,
      relatedEvents: event.relatedEvents?.map((relatedEvent) => ({
        ...relatedEvent,
        date: event.date,
        meetingLink: relatedEvent.meetingLink,
      })),
    }));
  };

  const events = getEvents();

  const convertTo24HourFormat = (time) => {
    let [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    // Normalize the modifier to handle both "A.M" and "AM"
    modifier = modifier.replace(".", "").toUpperCase();

    if (modifier === "PM" && hours < 12) {
        hours += 12;
    } else if (modifier === "AM" && hours === 12) {
        hours = 0;
    }

    return `${String(hours).padStart(2, '0')}:${String(minutes || 0).padStart(2, '0')}`;
};

  const handleDateChange = (direction) => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (currentView === "day") {
        newDate.setDate(prevDate.getDate() + (direction === "next" ? 1 : -1));
      } else if (currentView === "week") {
        newDate.setDate(prevDate.getDate() + (direction === "next" ? 7 : -7));
      } else if (currentView === "month") {
        newDate.setMonth(prevDate.getMonth() + (direction === "next" ? 1 : -1));
      }
      return newDate;
    });
  };

  const handleEventClick = (event, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 400;
    const popupHeight = 200;

    let xPosition = rect.right + 10;
    if (xPosition + popupWidth > viewportWidth) {
      xPosition = rect.left - popupWidth - 10;
    }

    let yPosition = rect.top;
    if (yPosition + popupHeight > viewportHeight) {
      yPosition = viewportHeight - popupHeight - 10;
    }

    setPopupPosition({ x: xPosition, y: yPosition });

    const eventsForSlot = events.filter(
      (e) =>
        formatDateForCompare(e.date) === formatDateForCompare(event.date) &&
        e.time === event.time
    );

    const allEvents = eventsForSlot.reduce((acc, curr) => {
      acc.push(curr);
      if (curr.relatedEvents) {
        acc.push(
          ...curr.relatedEvents.map((re) => ({
            ...re,
            date: curr.date,
            time: curr.time,
          }))
        );
      }
      return acc;
    }, []);

    if (allEvents.length > 1) {
      setSelectedEvent({
        ...event,
        relatedEvents: allEvents.filter((e) => e.id !== event.id),
      });
    } else {
      setSelectedInterview({
        ...event,
        meetingLink: event.meetingLink || "https://meet.google.com",
      });
    }
  };

  const handleInterviewClick = (event) => {
    console.log("Selected interview:", event);
    setSelectedInterview({
      ...event,
      meetingLink: event.meetingLink || "https://meet.google.com",
    });
  };

  const renderEventList = () => {
    if (!selectedEvent) return null;

    return (
      <div
        className="event-popup"
        style={{
          left: `${popupPosition.x}px`,
          top: `${popupPosition.y}px`,
        }}
      >
        <div className="event-list">
          {[selectedEvent, ...(selectedEvent.relatedEvents || [])].map(
            (event, index) => (
              <div
                key={index}
                className="event-list-item"
                onClick={() => handleInterviewClick(event)}
                style={{ cursor: "pointer" }}
              >
                <div className="event-blue-line"></div>
                <div className="event-content">
                  <div className="event-title">
                    {event.title}
                  </div>

                  <div className="event-interviewer">
                    {event.round && <span>{event.round}</span>} |
                    Interviewer: {event.interviewer}
                  </div>
                  <div className="event-datetime">
                    {event.date} | {event.timeRange}
                  </div>
                </div>
                <div className="event-actions">
                  <button
                    className="edit-button"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEvent(null);
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )
          )}
        </div>

        <div className="close-popup-btn">
          <button
            className="close-button-event"
            onClick={() => setSelectedEvent(null)}
          >
            X
          </button>
        </div>
      </div>
    );
  };

  const renderInterviewDetails = () => {
    if (!selectedInterview) return null;

    return (
      <div className="interview-details-popup">
        <div className="popup-header">
          <span className="popup-date">Interview Details</span>
          <button
            className="close-button"
            onClick={() => setSelectedInterview(null)}
          >
            ✖️
          </button>
        </div>
        <div className="popup-content">
          <div className="details-section">
            <div className="info-row">
              <label>Interview With</label>
              <span>{selectedInterview.interviewer}</span>
            </div>
            <div className="info-row">
              <label>Position</label>
              <span>{selectedInterview.title.toLowerCase()}</span>
            </div>
            <div className="info-row">
              <label>Created By</label>
              <span>-</span>
            </div>
            <div className="info-row">
              <label>Interview Date</label>
              <span>{selectedInterview.date}</span>
            </div>
            <div className="info-row">
              <label>Interview Time</label>
              <span>{selectedInterview.timeRange}</span>
            </div>
            <div className="info-row">
              <label>Interview Via</label>
              <span>Google Meet</span>
            </div>
            <div className="document-section">
              <button className="doc-button">
                <span>Resume.docx</span>
                <div className="button-icons">
                  <span className="view-icon">👁️</span>
                  <span className="download-icon">⬇️</span>
                </div>
              </button>
              <button className="doc-button">
                <span>Aadharcard</span>
                <div className="button-icons">
                  <span className="view-icon">👁️</span>
                  <span className="download-icon">⬇️</span>
                </div>
              </button>
            </div>
          </div>
          <div className="meet-section">
            <img src={Gicon} alt="Google Meet" className="meet-icon" />
            <a
              href={selectedInterview.meetingLink || "https://meet.google.com"}
              target="_blank"
              rel="noopener noreferrer"
              className="join-button"
            >
              JOIN
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderEvent = (day, time) => {
    const events = getEvents();

    // Convert the provided time to 24-hour format for comparison
    const time24 = convertTo24HourFormat(time);

    const eventsForSlot = events.filter(
      (e) =>
        formatDateForCompare(e.date) === day && convertTo24HourFormat(e.time) === time24
    );

    // Check if events are found
    console.log("Events for Slot:", eventsForSlot);
    if (eventsForSlot.length === 0) return null;

    // Only pick the main event
    const mainEvent = eventsForSlot[0];
    const relatedEvents = mainEvent.relatedEvents || [];

    // Combine main event with unique related events
    const allEvents = [mainEvent, ...relatedEvents].filter(
      (event, index, self) =>
        index === self.findIndex((e) => e.id === event.id)
    );

    const totalEvents = allEvents.length;

    return (
      <div
        className="event-card"
        onClick={(e) => handleEventClick(mainEvent, e)}
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

  return (
    <div className="calendar-container">
      <div className="header-title">Your Todo's</div>
      <div className="calendar-header">
        <div className="nav-section">
          <button className="nav-btn" onClick={() => handleDateChange("prev")}>
            &lt;
          </button>

          <button className="nav-btn" onClick={() => handleDateChange("next")}>
            &gt;
          </button>
          <span className="week-number">{currentWeek.weekNumber}</span>
        </div>

        <div className="date-range"><strong>{currentWeek.dateRange}</strong></div>

        <div className="view-options">
          <button
            className={currentView === "day" ? "active" : ""}
            onClick={() => setCurrentView("day")}
          >
            Day
          </button>
          <button
            className={currentView === "week" ? "active" : ""}
            onClick={() => setCurrentView("week")}
          >
            Week
          </button>
          <button
            className={currentView === "month" ? "active" : ""}
            onClick={() => setCurrentView("month")}
          >
            Month
          </button>
        </div>
      </div>

      <div className="calendar-body">
        {currentView === "day" && (
          <DayView
            selectedDate={selectedDate}
            events={events}
            timeSlots={timeSlots}
            onEventClick={handleEventClick}
          />
        )}
        {currentView === "week" && (
          <div className="week-view">
            <div className="days-header">
              {currentWeek.days.map((day) => (
                <div key={day.date} className="day-header">
                  <div className="date">{day.date}</div>
                  <div className="day">{day.day}</div>
                </div>
              ))}
            </div>

            <div className="time-grid">
              <div className="time-column">
                {timeSlots.map((time) => (
                  <div key={time} className="time-slot">
                    {time}
                  </div>
                ))}
              </div>

              <div className="events-grid">
                {currentWeek.days.map((day) => (
                  <div key={day.date} className="day-column">
                    {timeSlots.map((time) => (
                      <div key={`${day.date}-${time}`} className="time-cell">
                        {renderEvent(day.date, time)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {currentView === "month" && (
          <MonthView
            currentMonth={selectedDate}
            events={events}
            onEventClick={handleEventClick}
          />
        )}
      </div>

      {selectedEvent && renderEventList()}
      {selectedInterview && renderInterviewDetails()}
    </div>
  );
};

export default MyCalendar;