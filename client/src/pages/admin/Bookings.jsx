import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Calendar, User, Clock, Ban, CheckCircle } from "lucide-react"; // Filter icon hata diya
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "cancelled", label: "Canceled" },
  ];

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bookings?filter=${filter}`);
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    // Optimistic Update: List se turant hatao
    setBookings((prev) => prev.filter((b) => b.id !== id));

    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking cancelled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel");
      fetchBookings(); // Fail hua toh wapas lao
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800">
      {/* --- HEADER --- */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bookings
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      {/* --- TABS ONLY (Filter Button Removed) --- */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                filter === tab.id
                  ? "bg-[#262626] text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#1a1a1a]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- BOOKINGS LIST --- */}
      <div className="border border-gray-800 rounded-lg min-h-[400px] bg-[#0C0C0C] relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        ) : bookings.length > 0 ? (
          // --- LIST VIEW ---
          <div className="divide-y divide-gray-800">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 hover:bg-[#111] transition-colors flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {/* Left: Info */}
                <div className="flex gap-4 w-full items-center">
                  {/* Date Box */}
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded border border-gray-800 bg-[#161616] shrink-0">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                      {booking.booking_date
                        ? format(parseISO(booking.booking_date), "MMM")
                        : ""}
                    </span>
                    <span className="text-lg font-bold text-white leading-none">
                      {booking.booking_date
                        ? format(parseISO(booking.booking_date), "dd")
                        : ""}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      {booking.event_title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {booking.booker_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />{" "}
                        {booking.start_time?.slice(0, 5)} -{" "}
                        {booking.end_time?.slice(0, 5)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="shrink-0">
                  {filter === "upcoming" && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-gray-800 rounded hover:bg-red-950/30 hover:border-red-900 transition"
                    >
                      <Ban className="w-3 h-3" /> Cancel
                    </button>
                  )}
                  {filter === "cancelled" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 px-3 py-1.5 bg-[#1a1a1a] rounded border border-gray-800">
                      <Ban className="w-3 h-3" /> Canceled
                    </span>
                  )}
                  {filter === "past" && (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-500 px-3 py-1.5 bg-[#1a1a1a] rounded border border-gray-800">
                      <CheckCircle className="w-3 h-3" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // --- EMPTY STATE ---
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-[#161616] rounded-full flex items-center justify-center mb-4 border border-gray-800">
              <Calendar className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-white font-semibold text-lg">
              No {filter} bookings
            </h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs">
              You have no {filter} bookings. Your {filter} bookings will show up
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
