import { useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchEventBySlug, createBooking } from "../../lib/api";
import { Calendar, Clock, ArrowLeft, User, Mail, Globe } from "lucide-react";
import { format, parseISO } from "date-fns";
import toast from "react-hot-toast";

// Import custom hook for dynamic title
import { usePageTitle } from "../../hooks/usePageTitle";

export default function BookingForm() {
  // --- 1. Hooks & Query Params ---
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract selected date and time from the URL (e.g., ?date=2026-01-20&time=09:00)
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  // --- 2. State Management ---
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  // --- 3. Dynamic Title ---
  // Show "Confirm [Event Title]" on the browser tab
  usePageTitle(event ? `Confirm ${event.title}` : "Booking Details");

  // --- 4. Fetch Event ---
  useEffect(() => {
    if (slug) {
      fetchEventBySlug(slug)
        .then((res) => setEvent(res.data))
        .catch(() => toast.error("Event not found"));
    }
  }, [slug]);

  // --- 5. Helper Functions ---

  /**
   * Calculates the End Time based on Start Time + Duration
   * returns: "HH:MM" string
   */
  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime || !durationMinutes) return "00:00";
    const [hours, minutes] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes);
    date.setMinutes(date.getMinutes() + durationMinutes);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // --- 6. Form Submission ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!event) return;
    setLoading(true);

    try {
      const endTime = calculateEndTime(timeParam, event.duration_minutes);

      // Automatically detect the user's timezone (e.g., "Asia/Kolkata")
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await createBooking({
        event_type_id: event.id,
        booking_date: dateParam,
        start_time: timeParam,
        end_time: endTime,
        booker_name: formData.name,
        booker_email: formData.email,
        time_zone: userTimezone,
      });

      toast.success("Booking Confirmed!");
      navigate("/success"); // Redirect to success page
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Booking failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- 7. Render ---

  if (!event)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 bg-black">
        Loading...
      </div>
    );

  const formattedDate = dateParam
    ? format(parseISO(dateParam), "EEEE, d MMMM yyyy")
    : "";

  return (
    <div className="flex items-center justify-center min-h-screen p-4 font-sans text-white bg-black">
      {/* Main Card Container */}
      <div className="bg-black w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 border border-gray-800 rounded-xl shadow-2xl overflow-hidden min-h-[500px]">
        {/* LEFT COLUMN: Event Summary */}
        <div className="flex flex-col p-8 border-b border-gray-800 md:border-b-0 md:border-r">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-8 text-sm font-medium text-gray-400 transition hover:text-white w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <div className="flex-1">
            <p className="mb-1 text-sm font-medium text-gray-500">
              Rohit Admin
            </p>
            <h1 className="mb-6 text-2xl font-bold text-white">
              {event.title}
            </h1>

            <div className="space-y-5 text-gray-400">
              {/* Date Info */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                <span className="font-medium text-gray-300">
                  {formattedDate}
                </span>
              </div>

              {/* Time Info */}
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                <span className="font-medium text-gray-300">
                  {timeParam} -{" "}
                  {calculateEndTime(timeParam, event.duration_minutes)}
                  <span className="ml-1 font-normal text-gray-500">
                    ({event.duration_minutes} mins)
                  </span>
                </span>
              </div>

              {/* Video Call Info */}
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-500 mt-0.5" />
                <span className="font-medium text-gray-300">Video Call</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Input Form */}
        <div className="flex flex-col justify-center p-8">
          <h2 className="mb-6 text-xl font-bold text-white">Enter Details</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  // Dark Input Styling
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition text-sm outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition text-sm outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Additional Notes (Optional) */}
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Additional notes
              </label>
              <textarea
                rows="3"
                className="block w-full p-3 bg-[#0a0a0a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:border-white transition text-sm outline-none resize-none"
                placeholder="Please share anything that will help prepare for our meeting."
              ></textarea>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sm font-medium text-gray-400 transition hover:text-white"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {loading ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
