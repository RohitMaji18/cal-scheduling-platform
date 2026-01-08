import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Save, Globe, Plus, Copy, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Availability() {
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("Europe/London");

  // Default: Sabhi din inactive, Monday-Friday 9-5 set kar rahe hain
  const defaultSchedule = [
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

  const [schedule, setSchedule] = useState(defaultSchedule);

  // Load Existing Availability
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      const res = await api.get("/availability");
      const savedRules = res.data;

      // Backend data ko UI state ke saath merge karna
      const updatedSchedule = defaultSchedule.map((dayItem) => {
        const found = savedRules.find((r) => r.day_of_week === dayItem.dayIdx);
        if (found) {
          return {
            ...dayItem,
            active: true,
            start: found.start_time.slice(0, 5), // "09:00:00" -> "09:00"
            end: found.end_time.slice(0, 5),
            id: found.id,
            timezone: found.timezone,
          };
        }
        return dayItem;
      });

      if (savedRules.length > 0) setTimezone(savedRules[0].timezone);
      setSchedule(updatedSchedule);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Day Active/Inactive
  const toggleDay = (index) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  // Update Time Slots
  const updateTime = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  // Copy Time to All Active Days
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

  const handleSave = async () => {
    setLoading(true);
    try {
      // Strategy:
      // 1. Jo din active nahi hain unhe Backend se delete karo (agar ID hai)
      // 2. Jo din active hain unhe Insert/Update karo

      for (const day of schedule) {
        if (!day.active && day.id) {
          // Delete inactive rule
          await api.delete(`/availability/${day.id}`);
          day.id = null; // Reset ID in state
        } else if (day.active) {
          const payload = {
            day_of_week: day.dayIdx,
            start_time: day.start,
            end_time: day.end,
            timezone: timezone,
          };

          if (day.id) {
            // Update logic (Delete purana + Insert naya because PUT might not exist in simple backend)
            await api.delete(`/availability/${day.id}`);
            const res = await api.post("/availability", payload);
            day.id = res.data.id; // Naya ID save karo
          } else {
            // Create new
            const res = await api.post("/availability", payload);
            day.id = res.data.id;
          }
        }
      }

      toast.success("Availability updated successfully!");
      fetchAvailability(); // Refresh to be safe
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !schedule[0].id)
    return (
      <div className="p-10 text-center text-gray-500">
        Loading availability...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Availability</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Configure times when you are available for bookings.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition flex items-center gap-2"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* --- LEFT: WEEKLY SCHEDULE --- */}
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
                {/* Toggle & Day Name */}
                <div className="flex items-center gap-4 w-full sm:w-40">
                  <div className="relative inline-block w-10 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={day.active}
                      onChange={() => toggleDay(index)}
                      className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-white"
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

                {/* Time Inputs (Only if Active) */}
                {day.active ? (
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex items-center gap-2 flex-1 sm:flex-none">
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

                    {/* Actions: Copy & Delete */}
                    <button
                      onClick={() => copyToAll(index)}
                      title="Copy this time to all active days"
                      className="p-2 text-gray-500 hover:text-white transition"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleDay(index)}
                      className="p-2 text-gray-500 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 italic">
                    Unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- RIGHT: TIMEZONE --- */}
        <div className="w-full lg:w-80 h-fit">
          <div className="border border-gray-800 rounded-lg p-5 bg-[#0C0C0C]">
            <h3 className="text-sm font-semibold text-white mb-4">Timezone</h3>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white text-sm rounded-md pl-9 pr-3 py-2 focus:border-white outline-none appearance-none"
              >
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="UTC">UTC (Universal)</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Your booking page will adapt to the booker's timezone
              automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
