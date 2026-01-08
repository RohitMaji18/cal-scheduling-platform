import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Globe, Copy, Trash2 } from "lucide-react"; // Removed unused imports
import toast from "react-hot-toast";

// Import our custom hook for dynamic tab titles
import { usePageTitle } from "../../hooks/usePageTitle";

// Define the default weekly schedule structure
// This prevents re-creating this array on every render
const DEFAULT_SCHEDULE = [
  {
    day: "Sunday",
    dayIdx: 0,
    active: false,
    start: "09:00",
    end: "17:00",
    id: null,
  },
  {
    day: "Monday",
    dayIdx: 1,
    active: true,
    start: "09:00",
    end: "17:00",
    id: null,
  },
  {
    day: "Tuesday",
    dayIdx: 2,
    active: true,
    start: "09:00",
    end: "17:00",
    id: null,
  },
  {
    day: "Wednesday",
    dayIdx: 3,
    active: true,
    start: "09:00",
    end: "17:00",
    id: null,
  },
  {
    day: "Thursday",
    dayIdx: 4,
    active: true,
    start: "09:00",
    end: "17:00",
    id: null,
  },
  {
    day: "Friday",
    dayIdx: 5,
    active: true,
    start: "09:00",
    end: "17:00",
    id: null,
  },
  {
    day: "Saturday",
    dayIdx: 6,
    active: false,
    start: "09:00",
    end: "17:00",
    id: null,
  },
];

export default function Availability() {
  // --- 1. Page Title ---
  usePageTitle("Availability");

  // --- 2. State Management ---
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("Europe/London");
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);

  // --- 3. Initial Data Fetch ---
  useEffect(() => {
    fetchAvailability();
  }, []);

  /**
   * Fetches existing rules from the backend and merges them with the default schedule.
   */
  const fetchAvailability = async () => {
    try {
      const res = await api.get("/availability");
      const savedRules = res.data;

      // Merge backend data with UI state
      // We map over the default schedule and check if a rule exists for that day
      const updatedSchedule = DEFAULT_SCHEDULE.map((dayItem) => {
        const found = savedRules.find((r) => r.day_of_week === dayItem.dayIdx);

        if (found) {
          return {
            ...dayItem,
            active: true, // Mark as active if found in DB
            start: found.start_time.slice(0, 5), // Format "09:00:00" -> "09:00"
            end: found.end_time.slice(0, 5),
            id: found.id,
            timezone: found.timezone,
          };
        }
        return dayItem; // Return default if no rule exists
      });

      // Set global timezone from the first rule found (if any)
      if (savedRules.length > 0) setTimezone(savedRules[0].timezone);

      setSchedule(updatedSchedule);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. User Interactions ---

  // Toggle a day ON or OFF
  const toggleDay = (index) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  // Update specific start/end times
  const updateTime = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  // Copy time from one day to all other active days
  const copyToAll = (sourceIndex) => {
    const source = schedule[sourceIndex];
    const newSchedule = schedule.map((day) => {
      if (day.active) {
        return { ...day, start: source.start, end: source.end };
      }
      return day;
    });
    setSchedule(newSchedule);
    toast.success("Copied to all active days");
  };

  // --- 5. Save Logic (Complex) ---
  const handleSave = async () => {
    setLoading(true);
    try {
      // Loop through each day and determine if we need to Create, Update, or Delete
      for (const day of schedule) {
        // CASE A: Day is inactive BUT has an ID -> It was active before, so DELETE it.
        if (!day.active && day.id) {
          await api.delete(`/availability/${day.id}`);
          day.id = null; // Clear ID locally
        }

        // CASE B: Day is active -> Create or Update
        else if (day.active) {
          const payload = {
            day_of_week: day.dayIdx,
            start_time: day.start,
            end_time: day.end,
            timezone: timezone,
          };

          if (day.id) {
            // Update: Since backend might not support simple PUT, we Delete old + Create new
            await api.delete(`/availability/${day.id}`);
            const res = await api.post("/availability", payload);
            day.id = res.data.id;
          } else {
            // Create: New entry
            const res = await api.post("/availability", payload);
            day.id = res.data.id;
          }
        }
      }

      toast.success("Availability updated successfully!");
      fetchAvailability(); // Refresh data to ensure sync
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  // --- 6. Render ---

  if (loading && !schedule[0].id && loading) {
    // Show simple loader only on initial fetch
    return (
      <div className="p-10 text-center text-gray-500">
        Loading availability...
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans text-white bg-black selection:bg-gray-800">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 pb-6 mb-8 border-b border-gray-900 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="mt-2 text-sm text-gray-500">
            Configure times when you are available for bookings.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-black transition bg-white rounded-full hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* --- LEFT: Weekly Schedule Editor --- */}
        <div className="flex-1 border border-gray-800 rounded-lg bg-[#0C0C0C] overflow-hidden">
          <div className="p-4 border-b border-gray-800 bg-[#111]">
            <h3 className="text-sm font-semibold text-white">
              Default Schedule
            </h3>
          </div>

          <div className="divide-y divide-gray-800">
            {schedule.map((day, index) => (
              <div
                key={day.day}
                className={`p-4 flex flex-col sm:flex-row items-center gap-4 transition-colors ${
                  day.active ? "bg-black" : "bg-[#0a0a0a]"
                }`}
              >
                {/* 1. Toggle Switch & Day Name */}
                <div className="flex items-center w-full gap-4 sm:w-40">
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={day.active}
                      onChange={() => toggleDay(index)}
                      className="absolute block w-5 h-5 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox checked:right-0 checked:border-white"
                    />
                    <label
                      onClick={() => toggleDay(index)}
                      className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer transition-colors ${
                        day.active ? "bg-green-600" : "bg-gray-700"
                      }`}
                    ></label>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      day.active ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {day.day}
                  </span>
                </div>

                {/* 2. Time Inputs (Visible only if active) */}
                {day.active ? (
                  <div className="flex items-center w-full gap-2">
                    <div className="flex items-center flex-1 gap-2 sm:flex-none">
                      <input
                        type="time"
                        value={day.start}
                        onChange={(e) =>
                          updateTime(index, "start", e.target.value)
                        }
                        className="bg-black border border-gray-700 text-white text-sm rounded-md px-2 py-1.5 focus:border-white outline-none w-28"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="time"
                        value={day.end}
                        onChange={(e) =>
                          updateTime(index, "end", e.target.value)
                        }
                        className="bg-black border border-gray-700 text-white text-sm rounded-md px-2 py-1.5 focus:border-white outline-none w-28"
                      />
                    </div>

                    {/* 3. Action Buttons (Copy / Delete) */}
                    <div className="flex items-center gap-1 ml-auto sm:ml-0">
                      <button
                        onClick={() => copyToAll(index)}
                        title="Copy this time to all active days"
                        className="p-2 text-gray-500 transition hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleDay(index)}
                        title="Turn off this day"
                        className="p-2 text-gray-500 transition hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm italic text-gray-600">
                    Unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: Timezone Settings --- */}
        <div className="w-full lg:w-80 h-fit">
          <div className="border border-gray-800 rounded-lg p-5 bg-[#0C0C0C]">
            <h3 className="mb-4 text-sm font-semibold text-white">Timezone</h3>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full py-2 pr-3 text-sm text-white bg-black border border-gray-700 rounded-md outline-none appearance-none pl-9 focus:border-white"
              >
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="UTC">UTC (Universal)</option>
              </select>
            </div>
            <p className="mt-3 text-xs text-gray-500">
              Your booking page will adapt to the booker's timezone
              automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
