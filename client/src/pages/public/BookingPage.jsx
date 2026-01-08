import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import {
  Clock,
  Globe,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { fetchEventBySlug, fetchSlots } from "../../lib/api";

// Import standard CSS for the calendar to ensure proper layout
import "react-day-picker/dist/style.css";

// Import custom hook for dynamic title
import { usePageTitle } from "../../hooks/usePageTitle";

export default function BookingPage() {
  // --- 1. Hooks & State ---
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);

  // Loading & Error States
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

  // --- 2. Dynamic Title ---
  // If event exists, show "Title | Cal Scheduling", otherwise "Select a Date"
  usePageTitle(event ? event.title : "Select a Date");

  // --- 3. Event Fetching ---
  useEffect(() => {
    fetchEventBySlug(slug)
      .then((res) => {
        setEvent(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Event fetch error:", err);
        setError("Event not found");
      });
  }, [slug]);

  // --- 4. Date Selection & Slot Fetching ---

  const handleDateSelect = async (date) => {
    setSelectedDate(date);

    // Only fetch slots if a valid date is selected and event data is loaded
    if (date && event) {
      setLoadingSlots(true);
      setSlots([]); // Clear previous slots
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await fetchSlots(event.id, dateStr);
        setSlots(res.data);
      } catch (err) {
        console.error("Error fetching slots:", err);
      } finally {
        setLoadingSlots(false);
      }
    } else {
      setSlots([]); // Clear slots if deselected
    }
  };

  // --- 5. Custom Components (Dark Mode Arrows) ---

  const CustomHeader = ({
    displayMonth,
    onPreviousClick,
    onNextClick,
    previousMonth,
    nextMonth,
  }) => (
    <div className="flex items-center justify-between px-2 mb-4">
      <button
        onClick={onPreviousClick}
        disabled={!previousMonth}
        className="p-2 transition rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <span className="text-lg font-semibold text-white">
        {format(displayMonth, "MMMM yyyy")}
      </span>
      <button
        onClick={onNextClick}
        disabled={!nextMonth}
        className="p-2 transition rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-30"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  // --- 6. Render ---

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen text-white bg-black">
        {error}
      </div>
    );
  if (!event)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-zinc-500">
        Loading...
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans text-white bg-black">
      {/* CUSTOM CSS STYLES 
         This <style> block overrides default 'react-day-picker' styles 
         to match the Dark Theme and Square button design.
      */}
      <style>{`
        /* Reset Container Margins */
        .rdp { margin: 0; }
        
        /* Table Layout Fixes */
        .rdp-month { background: transparent; }
        .rdp-table { max-width: 100%; border-collapse: collapse; }
        
        /* Header Cell Styling (MO, TU, WE...) */
        .rdp-head_cell { color: #71717a; font-weight: 400; font-size: 0.75rem; text-transform: uppercase; padding-bottom: 0.5rem; }

        /* DAY BUTTON DESIGN (Rounded Square, Dark Gray) */
        .rdp-day {
           height: 40px;
           width: 40px;
           border-radius: 6px; 
           background-color: #27272a; /* Zinc-800 */
           color: #d4d4d8; 
           border: 2px solid transparent; 
           margin: 1px; 
           font-weight: 500;
           font-size: 0.9rem;
        }

        /* Hover Effect (White Border) */
        .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
           border-color: white !important;
           background-color: #27272a !important; 
           color: white !important;
        }

        /* Selected Date (White Box) */
        .rdp-day_selected {
           background-color: white !important;
           color: black !important;
           font-weight: bold;
           border: none;
        }

        /* Today (Simple Bold) */
        .rdp-day_today:not(.rdp-day_selected) {
           color: white;
           font-weight: 900;
        }

        /* Disabled Dates */
        .rdp-day_disabled {
           background-color: transparent !important;
           opacity: 0.3;
        }
      `}</style>

      {/* Main Layout Grid */}
      <div className="bg-black w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 min-h-[600px]">
        {/* LEFT PANEL: Event Info */}
        <div className="flex flex-col p-8 border-b md:border-b-0 md:border-r border-zinc-800">
          <button
            onClick={() => navigate(-1)}
            className="mb-8 transition text-zinc-400 hover:text-white w-fit"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <p className="mb-2 font-medium text-zinc-500">Rohit Admin</p>
            <h1 className="mb-6 text-3xl font-bold tracking-tight text-white">
              {event.title}
            </h1>
            <div className="space-y-4 text-lg text-zinc-400">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-zinc-500" />
                <span>{event.duration_minutes} mins</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-zinc-500" />
                <span>Video Call</span>
              </div>
            </div>
            <p className="mt-8 leading-relaxed text-zinc-400">
              {event.description}
            </p>
          </div>
        </div>

        {/* MIDDLE PANEL: Calendar */}
        <div className="flex flex-col items-center p-8 border-b md:border-b-0 md:border-r border-zinc-800">
          <h2 className="self-start mb-6 text-xl font-semibold text-white">
            Select a Date
          </h2>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ before: new Date() }}
            showOutsideDays
            components={{ Head: CustomHeader }}
          />
        </div>

        {/* RIGHT PANEL: Time Slots */}
        <div className="p-8 overflow-y-auto max-h-[600px] bg-black relative">
          {selectedDate ? (
            <div className="flex flex-col h-full animate-fade-in">
              <h3 className="sticky top-0 z-10 py-2 mb-6 text-lg font-semibold text-white bg-black">
                {format(selectedDate, "EEEE, d MMMM")}
              </h3>

              {loadingSlots ? (
                // Loading Spinner
                <div className="flex justify-center flex-1 py-20">
                  <div className="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
                </div>
              ) : slots.length > 0 ? (
                // Slots Grid
                <div className="grid content-start flex-1 grid-cols-1 gap-3">
                  {slots.map((time) => (
                    <button
                      key={time}
                      onClick={() =>
                        navigate(
                          `/${slug}/book?date=${format(
                            selectedDate,
                            "yyyy-MM-dd"
                          )}&time=${time}`
                        )
                      }
                      className="w-full px-6 py-4 text-lg font-semibold text-center text-white transition-all duration-200 border rounded-lg border-zinc-700 hover:border-white hover:bg-zinc-900"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        {time.slice(0, 5)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Empty State
                <div className="flex items-center justify-center flex-1 py-20 text-lg text-center text-zinc-500">
                  No slots available.
                </div>
              )}
            </div>
          ) : (
            // Initial State
            <div className="flex items-center justify-center h-full text-lg text-zinc-500">
              Select a date to view available times.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
