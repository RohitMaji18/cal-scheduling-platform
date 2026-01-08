import { useEffect, useState } from "react";
import api from "../../lib/api";
import {
  Clock,
  Link as LinkIcon,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Edit2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Dropdown States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    duration: 15,
  });

  // Click Outside to Close Menu (Simple logic without useRef)
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Load Events
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Could not load events");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ title: "", slug: "", description: "", duration: 15 });
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description || "",
      duration: event.duration_minutes,
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        duration_minutes: parseInt(formData.duration),
      };

      if (editingEvent) {
        // Edit Logic (Abhi ke liye create naya karega as per previous discussion)
        await api.post("/events", payload);
        toast.success("Event updated (New created)");
      } else {
        // Create Logic
        await api.post("/events", payload);
        toast.success("Event Type created");
      }

      setIsModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error("Error saving event:", err);
      toast.error(err.response?.data?.message || "Error saving event");
    }
  };

  const deleteEvent = async (id) => {
    if (!confirm("Delete this event type?")) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success("Deleted successfully");
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error("Failed to delete");
    }
  };

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    toast.success("Link copied");
  };

  // Auto-Slug Generator
  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!editingEvent) {
      setFormData({
        ...formData,
        title: val,
        slug: val
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""),
      });
    } else {
      setFormData({ ...formData, title: val });
    }
  };

  if (loading)
    return <div className="p-10 text-center text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-900 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 bg-black border border-gray-800 rounded-md text-sm text-gray-300 focus:border-gray-500 transition-colors"
          />
        </div>
      </div>

      {/* --- EVENTS LIST (Card Style) --- */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="group bg-black border border-gray-800 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center hover:border-gray-600 transition-all"
          >
            {/* Left Info */}
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <h3 className="font-semibold text-white text-base">
                {event.title}
                <span className="text-gray-500 font-normal ml-1 text-sm">
                  /{event.slug}
                </span>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-[#1C1C1C] text-gray-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border border-gray-800">
                  <Clock className="w-3 h-3" /> {event.duration_minutes}m
                </span>
                <span className="text-gray-500 text-xs hidden sm:inline-block">
                  {event.description?.substring(0, 30)}...
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
              {/* Toggle Switch (Visual Only) */}
              <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                  type="checkbox"
                  className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400"
                />
                <label className="toggle-label block overflow-hidden h-5 rounded-full bg-gray-800 cursor-pointer"></label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 border-l border-gray-800 pl-4">
                {/* Preview */}
                <a
                  href={`/${event.slug}`}
                  target="_blank"
                  className="p-2 text-gray-400 hover:text-white transition"
                  title="Preview"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Copy Link */}
                <button
                  onClick={() => copyLink(event.slug)}
                  className="p-2 text-gray-400 hover:text-white transition"
                  title="Copy Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                {/* Dropdown Menu (Three Dots) */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setActiveMenuId(
                        activeMenuId === event.id ? null : event.id
                      )
                    }
                    className="p-2 text-gray-400 hover:text-white transition rounded-md hover:bg-gray-900"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Content */}
                  {activeMenuId === event.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-gray-800 rounded-md shadow-xl z-50 py-1">
                      <button
                        onClick={() => openEditModal(event)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-900 hover:text-white flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-900/20 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-lg">
            No events found. Create one to get started.
          </div>
        )}
      </div>

      {/* --- MODAL (Exact Style) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                {editingEvent ? "Edit event type" : "Add a new event type"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Set up event types to offer different types of meetings.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Title
                </label>
                <input
                  required
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="Quick Chat"
                  className="w-full bg-black border border-gray-800 text-white rounded-md p-2.5 focus:border-white transition-colors"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  URL
                </label>
                <div className="flex items-center bg-black border border-gray-800 rounded-md overflow-hidden focus-within:border-white transition-colors">
                  <span className="px-3 text-gray-500 text-sm bg-[#0a0a0a] border-r border-gray-800 py-2.5">
                    cal.com/rohit/
                  </span>
                  <input
                    required
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="flex-1 bg-transparent border-none text-white p-2.5 focus:ring-0 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="A quick video meeting."
                    className="w-full bg-black border border-gray-800 text-white rounded-md p-2.5 focus:border-white transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Duration
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    className="w-full bg-black border border-gray-800 text-white rounded-md p-2.5 focus:border-white transition-colors"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500 text-sm">
                    minutes
                  </span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 transition"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
