"use client";

import React, { useState, useEffect } from "react";
import "./mainpage.css";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PlusCircle } from "react-feather";
import { X, Trash2 } from "react-feather";
import { useNavigate } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  set,
} from "date-fns";
import { parseISO } from "date-fns";

function Mainpage() {
  const navigate = useNavigate();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [eventTitle, setEventTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date()); // default to today
  const [startTime, setStartTime] = useState(""); // Start time state
  const [endTime, setEndTime] = useState("");
  const [newEvent, setNewEvent] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [username, setusername] = useState(null);
  const [events, setEvents] = useState([]); // Store events

  const hours = Array.from({ length: 25 }, (_, i) => i); // 0 to 24

  const getTopOffset = (time) => {
    if (!time || typeof time !== "string") return 0; // Fallback to 0 if time is invalid
    const [hour, minute] = time.split(":").map(Number);
    return (hour * 60 + minute) * (64 / 60); // 64px = 1 hour
  };

  const getHeight = (startTime, endTime) => {
    if (
      !startTime ||
      !endTime ||
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      return 0; // Fallback to 0 if times are invalid
    }
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const duration = eh * 60 + em - (sh * 60 + sm);
    return duration * (64 / 60); // 64px = 1 hour
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate("/");
  };

  const deleteEvent = async (event_id) => {
    try {
      const res = await fetch(`https://calendar-backend-an3x.onrender.com/DeleteEvent/${event_id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setEvents((prev) => prev.filter((event) => event.id !== event_id));
      } else {
        const result = await res.json();
        alert(result.message || "Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("An error occurred while deleting the event.");
    }
  };

  useEffect(() => {
    const uname = localStorage.getItem("username");
    if (uname) {
      setusername(uname);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetchEvents(username);
    }
  }, [username]);

  useEffect(() => {
    if (!selectedDate || isNaN(selectedDate)) return;

    const today = format(selectedDate, "yyyy-MM-dd");
    console.log("Selected date:", today);

    const filtered = events.filter((event) => {
      const eventDate = event.event_date;
      console.log("Event date:", eventDate);
      if (!eventDate) {
        console.warn("Invalid event date:", event.event_date);
        return false;
      }

      return eventDate === today;
    });

    console.log("Filtering for date:", today, filtered);
    setFilteredEvents(filtered);
  }, [selectedDate, events]);

  const fetchEvents = (uname) => {
    fetch(`https://calendar-backend-an3x.onrender.com/GetEvents/${uname}`)
      .then((res) => res.json())
      .then((data) => {
        // Format the event_date field for each event
        const formattedData = data.map((event) => ({
          ...event,
          event_date: format(new Date(event.event_date), "yyyy-MM-dd"), // Convert to yyyy-MM-dd
        }));

        setEvents(formattedData);
        console.log("Fetched and formatted events:", formattedData);
      })
      .catch((err) => console.error("Failed to load events", err));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!eventTitle || !selectedDate || !startTime || !endTime) return;

    // Check if start and end times are within the 24-hour range
    if (startTime < 0 || startTime > 24 || endTime < 0 || endTime > 24) {
      alert("Time must be between 0 and 24.");
      return;
    }

    const payload = {
      username: username,
      event_title: eventTitle,
      event_date: format(selectedDate, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
    };

    try {
      const res = await fetch("https://calendar-backend-an3x.onrender.com/Events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        console.log("Event created successfully:", payload);
        const newEvent = await res.json();

        setEvents((prevEvents) => [...prevEvents, newEvent]);
        // Update filtered events for the selected date
        const today = format(selectedDate, "yyyy-MM-dd");
        setFilteredEvents((prevFiltered) => [
          ...prevFiltered,
          {
            ...newEvent,
            event_date: today,
            start_time: newEvent.startTime,
            end_time: newEvent.endTime,
          },
        ]);

        console.log("New event added:", newEvent);
        // Reset form fields
        setEventTitle("");
        setStartTime("");
        setEndTime("");
        setNewEvent(false);
      } else {
        alert("Failed to create event.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong.");
    }
  };

  useEffect(() => {
    console.log("Updated events:", events);
  }, [events]);

  useEffect(() => {
    console.log("Updated filtered events:", filteredEvents);
  }, [filteredEvents]);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(lastDayOfMonth, { weekStartsOn: 0 });

  const daysToDisplay = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const addEvent = () => {
    setNewEvent(!newEvent);
  };

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-black mb-4 sm:mb-0">
            Calendar
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full sm:w-auto p-2 rounded-lg bg-white text-black focus:outline-none"
          />
          <div className="flex items-center p-2 rounded-lg bg-white">
            <input
              type="radio"
              className="p-3 mr-1 rounded-lg bg-white text-black focus:outline-none"
            />
            <p className="text-sm sm:text-base">Show registered events only</p>
          </div>
          <button
            className="flex hover:cursor-pointer items-center p-3 bg-white text-black rounded-lg hover:bg-black hover:text-white focus:outline-none"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-0 text-lg" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 items-start p-3">
        {/* Left Timetable */}
        <div className="p-4 bg-gray-50 font-sans w-full lg:w-[70%] h-[calc(100vh-7rem)] no-scrollbar rounded-2xl overflow-y-auto shadow-md">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6">
            {format(selectedDate, "d MMMM yyyy")}
          </h2>
          <div className="relative pl-10 sm:pl-20 border-l-2 border-gray-300">
            {/* Hour lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-t border-gray-300 relative"
              >
                <span className="absolute left-[-3rem] sm:left-[-4.5rem] text-xs sm:text-sm text-gray-500">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}

            {/* Events */}
            {filteredEvents.map((event, index) => {
              const top = getTopOffset(event.start_time);
              const height = getHeight(event.start_time, event.end_time);

              return (
                <div
                  key={index}
                  className={`absolute left-10 sm:left-20 w-[calc(100%-4rem)] sm:w-[calc(100%-6rem)] rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-gray-800 shadow-md border-gray-800 border-l-4 bg-gray-400 flex justify-between items-start ${event.color}`}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                  }}
                >
                  <div>
                    <div className="font-semibold">{event.event_title}</div>
                  </div>
                  <div className="text-xs mt-1 font-semibold text-gray-800">
                    {event.start_time} - {event.end_time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Boxes */}
        <div className="flex flex-col space-y-4 w-full lg:w-[30%] ">
          {/* Calendar Box */}
          <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-t-2xl">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-200 hover:cursor-pointer rounded-full focus:outline-none"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              <h2 className="text-lg sm:text-xl font-bold text-gray-700">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:cursor-pointer hover:bg-gray-200 rounded-full focus:outline-none"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs sm:text-sm font-semibold text-gray-500 p-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, index) => (
                  <div key={index}>{day}</div>
                )
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-7 gap-2 p-2">
              {daysToDisplay.map((day, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`relative text-center py-2 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isSameDay(day, selectedDate)
                      ? "bg-black text-white"
                      : isSameMonth(day, currentMonth)
                      ? "text-gray-800 hover:bg-gray-200"
                      : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </div>

          {/* Events Today Box */}
          <div className="bg-white rounded-2xl shadow-lg overflow-y-auto scrollbar-hide p-4">
            <div className="text-lg font-semibold text-gray-800 mb-2">
              Events Today
            </div>
            <div className="h-[1px] bg-gray-300 mb-3" />
            <div className="space-y-2">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => {
                  const colorClasses = [
                    "bg-yellow-400",
                    "bg-green-400",
                    "bg-purple-500",
                    "bg-blue-400",
                    "bg-pink-400",
                  ];
                  const color = colorClasses[index % colorClasses.length];

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between px-2 py-1"
                    >
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                        <div className="text-xs sm:text-sm font-medium text-gray-800">
                          {event.event_title}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          console.log(event.id);
                          deleteEvent(event.id);
                        }}
                        className="text-red-600 hover:cursor-pointer hover:text-red-800 text-xs sm:text-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-gray-500 text-sm">No events found.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Button */}
      <div className="flex justify-center fixed bottom-8 right-8">
        <button
          onClick={addEvent}
          className="group relative hover:cursor-pointer inline-flex items-center justify-center px-3 py-3 overflow-hidden font-bold text-white rounded-full shadow-2xl bg-gray-900 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 ease-out hover:scale-105"
        >
          <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
          <PlusCircle />
        </button>
      </div>

      {newEvent && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 transform transition-all duration-300 ease-in-out hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add New Event
              </h2>
              <button
                onClick={addEvent}
                className="text-gray-600 hover:cursor-pointer hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="EventTitle"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none"
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="EventDate"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="StartTime"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none"
                  placeholder="Enter start time (HH:mm)"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="EndTime"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none"
                  placeholder="Enter end time (HH:mm)"
                  required
                />
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="px-6 py-2 hover:cursor-pointer bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mainpage;
