import React from "react";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // <-- Import FontAwesomeIcon
import { useState } from "react"; // Import useState from React
import Calendar from "react-calendar";
import ReactDOM from "react-dom";
import { PlusCircle } from "react-feather"; // Import the PlusCircle icon from react-feather
import { X } from "react-feather"; // Import the X icon from react-feather

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
  add,
} from "date-fns";

function Mainpage() {
  const [newEvent, setnewEvent] = useState(false); // State to manage the new event modal visibility

  const addEvent = () => {
    setnewEvent(!newEvent); // Toggle the new event modal visibility
  };
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  // Fill calendar starting from the first day of the week
  const calendarStart = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // Sunday
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

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="flex flex-row items-center justify-between p-4">
        <div>
          <h1 className="text-4xl font-semibold text-black mb-6">Calendar</h1>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search..."
            className="ml-4 p-2 rounded-lg bg-white text-black focus:outline-none "
          />
          <div className="flex items-center p-2 rounded-lg bg-white">
            <input
              type="radio"
              placeholder="Search..."
              className=" p-3 mr-1 rounded-lg bg-white text-black focus:outline-none "
            />
            <p>Show registred event only</p>
          </div>
          <div>
            <button
              className="flex items-center p-3 bg-white text-black rounded-lg hover:bg-red-600 focus:outline-none"
              // onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 text-lg" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center p-4">
        <div className="text-amber-300">Hello</div>
        <div className="flex-col space-y-4 ">
          <div className="w-[380px] mx-auto bg-white rounded-2xl shadow-lg ">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 rounded-t-2xl">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-200 rounded-full focus:outline-none"
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
              <h2 className="text-xl font-bold text-gray-700">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-200 rounded-full focus:outline-none"
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
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-gray-500 p-2">
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
                  className={`text-center py-2 rounded-lg text-sm font-medium transition-all ${
                    isSameDay(day, new Date())
                      ? "bg-black text-white"
                      : isSameMonth(day, currentMonth)
                      ? "text-gray-800 hover:bg-gray-200 cursor-pointer"
                      : "text-gray-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-4 h-full "></div>
        </div>
      </div>
      <div className="flex justify-center fixed bottom-8 right-8">
        <button
          onClick={addEvent}
          className="group relative inline-flex items-center justify-center px-3 py-3 overflow-hidden font-bold text-white rounded-full shadow-2xl bg-gray-900 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 ease-out hover:scale-105"
        >
          <span className="absolute right-0 w-8 h-32 -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
          <PlusCircle />
        </button>
      </div>
      {newEvent && true && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 transform transition-all duration-300 ease-in-out hover:scale-105">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add New Event
              </h2>
              <button
                onClick={addEvent}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form className="space-y-6">
              <div>
                <label
                  htmlFor="EventTitle"
                  className="block text-sm font-medium text-gray-600 mb-2"
                >
                  Event Title
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-800 placeholder-gray-500 focus:outline-none "
                  placeholder="Enter event title"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-gray-900 text-white font-bold rounded-lg shadow-md hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              >
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mainpage;
