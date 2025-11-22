import React, { useState, useEffect } from "react";
import YoikiHeader from "../../../components/YoikiHeader";
import NavigationButtons from "../../../components/NavigationButtons";
import {
  fetchScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
  isUserAdmin,
} from "../../../utils/supabase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import withAuth from "../../../utils/withAuth";
import { formatTimeRange } from "../../../utils/dateUtils";

const Yoikischedule = ({ user }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Initial load of events
  useEffect(() => {
    const loadInitialEvents = async () => {
      setLoading(true);
      await fetchEvents(date);
      const adminStatus = await isUserAdmin();
      setIsAdmin(adminStatus);
      setLoading(false);
    };
    loadInitialEvents();
  }, []); // Empty dependency array for initial load

  // Handle month change
  const handleMonthChange = (newDate) => {
    fetchEvents(newDate);
  };

  const fetchEvents = async (selectedDate) => {
    try {
      const startOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0
      );
      const { data, error } = await fetchScheduleEvents(
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );
      if (error) throw error;
      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setFeedback({
        type: "error",
        message: "Failed to load events. Please try again.",
      });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: "", message: "" });

    try {
      // Basic validation
      if (!newEvent.title || !newEvent.start_time || !newEvent.end_time) {
        setFeedback({
          type: "error",
          message: "Please fill in all required fields",
        });
        setLoading(false);
        return;
      }

      // Check if end time is after start time
      if (new Date(newEvent.end_time) <= new Date(newEvent.start_time)) {
        setFeedback({
          type: "error",
          message: "End time must be after start time",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await createScheduleEvent(newEvent);

      if (error) throw error;

      if (data) {
        setEvents([...events, data[0]]);
        setNewEvent({
          title: "",
          description: "",
          start_time: "",
          end_time: "",
          location: "",
        });
        setFeedback({
          type: "success",
          message: "Event created successfully!",
        });
        fetchEvents(date);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setFeedback({
        type: "error",
        message: "Failed to create event. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Modified tileContent to show event indicators
  const tileContent = ({ date: tileDate, view }) => {
    if (view === "month") {
      const hasEvents = events.some(
        (event) =>
          new Date(event.start_time).toDateString() === tileDate.toDateString()
      );

      return hasEvents ? (
        <div className="event-indicator">
          <div className="event-dot" />
        </div>
      ) : null;
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent({
      ...event,
      start_time: event.start_time.slice(0, 16), // Format for datetime-local input
      end_time: event.end_time.slice(0, 16),
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const { error } = await updateScheduleEvent(editingEvent.id, {
        title: editingEvent.title,
        description: editingEvent.description,
        start_time: editingEvent.start_time,
        end_time: editingEvent.end_time,
        location: editingEvent.location,
      });

      if (error) throw error;

      setIsEditModalOpen(false);
      setEditingEvent(null);
      await fetchEvents(date);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Failed to update event. Please try again.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error } = await deleteScheduleEvent(eventId);
      if (error) throw error;
      await fetchEvents(date);
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

  return (
    <div className="mx-auto sm:px-8 w-full mb-4">
      <YoikiHeader />
      <NavigationButtons activePage="/yoiki/schedule" />
      <div className="flex-grow w-full">
        <div className="max-w-[768px] mx-auto px-8">
          <h1 className="text-xl font-semibold mb-6 text-darkslategray">
            가요이 일정
          </h1>
          <div className="mb-8 bg-white rounded-lg shadow-md sm:p-6">
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangered"></div>
              </div>
            ) : (
              <Calendar
                onChange={setDate}
                value={date}
                tileContent={tileContent}
                onActiveStartDateChange={({ activeStartDate }) =>
                  handleMonthChange(activeStartDate)
                }
                className="calendar-container"
                prevLabel={<span className="text-orangered">&lt;</span>}
                nextLabel={<span className="text-orangered">&gt;</span>}
                navigationLabel={({ date }) => (
                  <span className="text-lg font-semibold text-darkslategray">
                    {date.toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              />
            )}
          </div>
          {/* Events List */}
          <div className="bg-white mb-8">
            <h2 className="text-lg font-semibold mb-4 text-darkslategray">
              {date.toLocaleDateString()} 일정
            </h2>
            <div className="space-y-4">
              {events
                .filter(
                  (event) =>
                    new Date(event.start_time).toDateString() ===
                    date.toDateString()
                )
                .map((event) => (
                  <div key={event.id}>
                    <h3 className="font-semibold text-base text-darkslategray">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {event.description}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 text-xs text-gray-500">
                      <span className="mb-1 sm:mb-0">
                        {formatTimeRange(event.start_time, event.end_time)}
                      </span>
                      <span>{event.location}</span>
                    </div>
                    {isAdmin && (
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => handleEditClick(event)}
                          className="px-3 py-1 text-xs bg-mistyrose text-orangered rounded hover:bg-orangered hover:text-white transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="px-3 py-1 text-xs bg-red-100 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              {events.filter(
                (event) =>
                  new Date(event.start_time).toDateString() ===
                  date.toDateString()
              ).length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  일정이 없습니다.
                </p>
              )}
            </div>
          </div>
          {isEditModalOpen && editingEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg">
                <h2 className="text-lg font-semibold mb-4">이벤트 수정</h2>
                <form onSubmit={handleUpdateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      제목
                    </label>
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          title: e.target.value,
                        })
                      }
                      className="w-full [border:none] [outline:none] bg-whitesmoke-100 h-[35px] rounded-lg py-2.5 px-3 box-border text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      설명
                    </label>
                    <textarea
                      value={editingEvent.description}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          description: e.target.value,
                        })
                      }
                      className="w-full [border:none] [outline:none] bg-whitesmoke-100 rounded-lg py-2.5 px-3 box-border text-sm min-h-[80px] resize-y font-inter"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        시작일
                      </label>
                      <input
                        type="datetime-local"
                        value={editingEvent.start_time}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            start_time: e.target.value,
                          })
                        }
                        className="w-full [border:none] [outline:none] bg-whitesmoke-100 h-[35px] rounded-lg py-2.5 px-3 box-border text-sm font-inter"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        종료일
                      </label>
                      <input
                        type="datetime-local"
                        value={editingEvent.end_time}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            end_time: e.target.value,
                          })
                        }
                        className="w-full [border:none] [outline:none] bg-whitesmoke-100 h-[35px] rounded-lg py-2.5 px-3 box-border text-sm font-inter"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      장소
                    </label>
                    <input
                      type="text"
                      value={editingEvent.location}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          location: e.target.value,
                        })
                      }
                      className="w-full [border:none] [outline:none] bg-whitesmoke-100 h-[35px] rounded-lg py-2.5 px-3 box-border text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setEditingEvent(null);
                      }}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-orangered rounded-lg hover:bg-red-600 text-sm"
                    >
                      저장
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-darkslategray">
                일정 추가하기
              </h2>

              {feedback.message && (
                <div
                  className={`mb-4 p-3 rounded-lg ${
                    feedback.type === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Event title"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-start justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    설명
                  </label>
                  <input
                    id="description"
                    placeholder="Event description"
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="start_time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      시작일
                    </label>
                    <input
                      id="start_time"
                      type="datetime-local"
                      value={newEvent.start_time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, start_time: e.target.value })
                      }
                      className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="end_time"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      종료일
                    </label>
                    <input
                      id="end_time"
                      type="datetime-local"
                      value={newEvent.end_time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, end_time: e.target.value })
                      }
                      className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    장소 및 위치
                  </label>
                  <input
                    id="location"
                    type="text"
                    placeholder="Event location"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full [border:none] [outline:none] bg-whitesmoke-100 self-stretch h-[35px] rounded-lg flex flex-row items-center justify-start py-2.5 px-3 box-border font-inter font-semibold text-xs text-zinc-800 min-w-[196px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orangered hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                >
                  {loading ? "Creating Event..." : "Add Event"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Yoikischedule);
