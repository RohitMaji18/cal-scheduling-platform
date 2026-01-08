import { useEffect, useState, useCallback } from "react"; // 1. useCallback import kiya
import api from "../../lib/api";
import { Calendar, User, Clock, Ban, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Bookings() {
  usePageTitle("Bookings");

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("upcoming");

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "cancelled", label: "Canceled" },
  ];

  // --- 2. FIXED FETCH FUNCTION ---
  // useCallback use kiya taaki function stable rahe aur infinite loop na ho
  const fetchBookings = useCallback(async () => {
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
  }, [filter]); // Yeh function tabhi change hoga jab 'filter' change hoga

  // --- 3. UPDATED USEEFFECT ---
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]); // Ab hum safe tarike se function ko dependency bana sakte hain

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setBookings((prev) => prev.filter((b) => b.id !== id));

    try {
      await api.delete(`/bookings/${id}`);
      toast.success("Booking cancelled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel");
      fetchBookings();
    }
  };

  return (
    <div className="min-h-screen font-sans text-white bg-black selection:bg-gray-800">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Bookings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          See upcoming and past events booked through your event type links.
        </p>
      </div>

      {/* Filter Tabs */}
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

      {/* Bookings List */}
      <div className="border border-gray-800 rounded-lg min-h-[400px] bg-[#0C0C0C] relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <div className="w-6 h-6 border-b-2 border-white rounded-full animate-spin"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-4 hover:bg-[#111] transition-colors flex flex-col md:flex-row justify-between items-center gap-4"
              >
                {/* Left Info */}
                <div className="flex items-center w-full gap-4">
                  <div className="flex flex-col items-center justify-center h-12 w-12 rounded border border-gray-800 bg-[#161616] shrink-0">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                      {booking.booking_date
                        ? format(parseISO(booking.booking_date), "MMM")
                        : ""}
                    </span>
                    <span className="text-lg font-bold leading-none text-white">
                      {booking.booking_date
                        ? format(parseISO(booking.booking_date), "dd")
                        : ""}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {booking.event_title}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
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

                {/* Right Actions */}
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
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-[#161616] rounded-full flex items-center justify-center mb-4 border border-gray-800">
              <Calendar className="w-8 h-8 text-gray-500" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-white">
              No {filter} bookings
            </h3>
            <p className="max-w-xs mt-1 text-sm text-gray-500">
              You have no {filter} bookings. Your {filter} bookings will show up
              here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
