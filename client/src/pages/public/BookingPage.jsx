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

// 1. IMPORT STYLE (Yeh Grid banayega, isse mat hatana)
import "react-day-picker/dist/style.css";

export default function BookingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);

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

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    if (date && event) {
      setLoadingSlots(true);
      setSlots([]);
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await fetchSlots(event.id, dateStr);
        setSlots(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    } else {
      setSlots([]);
    }
  };

  // Custom Arrows (Dark Mode)
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
      {/* 2. STYLE OVERRIDES (Layout nahi chedenge, sirf Colors badlenge) */}
      <style>{`
        /* Calendar Container Reset */
        .rdp { margin: 0; }
        
        /* Table Layout (Grid Fix) */
        .rdp-month { background: transparent; }
        .rdp-table { max-width: 100%; border-collapse: collapse; }
        
        /* Headings (Mo, Tu, We) */
        .rdp-head_cell { color: #71717a; font-weight: 400; font-size: 0.75rem; text-transform: uppercase; padding-bottom: 0.5rem; }

        /* BUTTON DESIGN (Rounded Square, Dark Gray) */
        .rdp-day {
           height: 40px;
           width: 40px;
           border-radius: 6px; /* Rounded Square */
           background-color: #27272a; /* Zinc-800 (Dark Gray) */
           color: #d4d4d8; /* Light Text */
           border: 2px solid transparent; /* Border space */
           margin: 1px; /* Gap between boxes */
           font-weight: 500;
           font-size: 0.9rem;
        }

        /* Hover Effect (White Border) */
        .rdp-day:hover:not(.rdp-day_disabled):not(.rdp-day_selected) {
           border-color: white !important;
           background-color: #27272a !important; /* Keep dark bg */
           color: white !important;
        }

        /* Selected Date (White Box) */
        .rdp-day_selected {
           background-color: white !important;
           color: black !important;
           font-weight: bold;
           border: none;
        }

        /* Today (Simple Bold, No Blue) */
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

      <div className="bg-black w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 min-h-[600px]">
        {/* LEFT PANEL */}
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
            // ClassNames hata diye taaki layout na toote, style tag sambhal lega
          />
        </div>

        {/* RIGHT PANEL: Slots */}
        <div className="p-8 overflow-y-auto max-h-[600px] bg-black relative">
          {selectedDate ? (
            <div className="flex flex-col h-full animate-fade-in">
              <h3 className="sticky top-0 z-10 py-2 mb-6 text-lg font-semibold text-white bg-black">
                {format(selectedDate, "EEEE, d MMMM")}
              </h3>
              {loadingSlots ? (
                <div className="flex justify-center flex-1 py-20">
                  <div className="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
                </div>
              ) : slots.length > 0 ? (
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
                <div className="flex items-center justify-center flex-1 py-20 text-lg text-center text-zinc-500">
                  No slots available.
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-lg text-zinc-500">
              Select a date to view available times.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
