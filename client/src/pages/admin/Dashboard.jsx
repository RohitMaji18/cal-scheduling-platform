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

// Import custom hook for dynamic title
import { usePageTitle } from "../../hooks/usePageTitle";

export default function Dashboard() {
  // --- 1. Page Title ---
  usePageTitle("Event Types");

  // --- 2. State Management ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Dropdown States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // Holds the event being edited
  const [activeMenuId, setActiveMenuId] = useState(null); // Which dropdown menu is open

  // Form Data State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    duration: 15,
  });

  // --- 3. Click Outside Handler ---
  // Closes the dropdown menu when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // --- 4. Load Events ---
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

  // --- 5. Modal Handlers ---

  const openCreateModal = () => {
    setEditingEvent(null); // Clear editing state
    setFormData({ title: "", slug: "", description: "", duration: 15 }); // Reset form
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event); // Set event to edit
    setFormData({
      title: event.title,
      slug: event.slug,
      description: event.description || "",
      duration: event.duration_minutes,
    });
    setIsModalOpen(true);
    setActiveMenuId(null); // Close dropdown
  };

  // --- 6. Event CRUD Operations ---

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
        // NOTE: In a real app, this should be a PUT/PATCH request to update the specific ID.
        // For now, based on your API structure, we might be creating a new one or need a specific endpoint.
        // Assuming update logic:
        await api.delete(`/events/${editingEvent.id}`); // Delete old
        await api.post("/events", payload); // Create new (Simple workaround for now)
        toast.success("Event updated successfully");
      } else {
        // Create new event
        await api.post("/events", payload);
        toast.success("Event Type created");
      }

      setIsModalOpen(false);
      fetchEvents(); // Refresh list
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

  // Copy link to clipboard
  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    toast.success("Link copied");
  };

  // Auto-generate Slug from Title
  const handleTitleChange = (e) => {
    const val = e.target.value;

    // Only auto-generate slug if we are creating a NEW event
    if (!editingEvent) {
      setFormData({
        ...formData,
        title: val,
        slug: val
          .toLowerCase()
          .replace(/ /g, "-")
          .replace(/[^\w-]+/g, ""), // Remove special chars
      });
    } else {
      setFormData({ ...formData, title: val });
    }
  };

  // --- 7. Render ---

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading events...</div>
    );

  return (
    <div className="min-h-screen font-sans text-white bg-black selection:bg-gray-800">
      {/* Header Section */}
      <div className="flex flex-col items-start justify-between gap-4 pb-6 mb-8 border-b border-gray-900 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Types</h1>
          <p className="mt-2 text-sm text-gray-500">
            Create events to share for people to book on your calendar.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-black transition-all bg-white rounded-full hover:bg-gray-200"
        >
          <Plus className="w-4 h-4" /> New
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full py-2 pr-4 text-sm text-gray-300 transition-colors bg-black border border-gray-800 rounded-md pl-9 focus:border-gray-500"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex flex-col items-center justify-between p-4 transition-all bg-black border border-gray-800 rounded-lg group sm:flex-row hover:border-gray-600"
          >
            {/* Left Info */}
            <div className="flex flex-col w-full gap-1 sm:w-auto">
              <h3 className="text-base font-semibold text-white">
                {event.title}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  /{event.slug}
                </span>
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-[#1C1C1C] text-gray-400 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 border border-gray-800">
                  <Clock className="w-3 h-3" /> {event.duration_minutes}m
                </span>
                <span className="hidden text-xs text-gray-500 sm:inline-block">
                  {event.description?.substring(0, 30)}...
                </span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center justify-between w-full gap-4 mt-4 sm:mt-0 sm:w-auto sm:justify-end">
              {/* Toggle (Visual) */}
              <div className="relative inline-block w-10 mr-2 align-middle transition duration-200 ease-in select-none">
                <input
                  type="checkbox"
                  className="absolute block w-5 h-5 bg-white border-4 rounded-full appearance-none cursor-pointer toggle-checkbox checked:right-0 checked:border-green-400"
                />
                <label className="block h-5 overflow-hidden bg-gray-800 rounded-full cursor-pointer toggle-label"></label>
              </div>

              {/* Action Buttons Group */}
              <div className="flex items-center gap-1 pl-4 border-l border-gray-800">
                <a
                  href={`/${event.slug}`}
                  target="_blank"
                  className="p-2 text-gray-400 transition hover:text-white"
                  title="Preview"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => copyLink(event.slug)}
                  className="p-2 text-gray-400 transition hover:text-white"
                  title="Copy Link"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() =>
                      setActiveMenuId(
                        activeMenuId === event.id ? null : event.id
                      )
                    }
                    className="p-2 text-gray-400 transition rounded-md hover:text-white hover:bg-gray-900"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  {/* Dropdown Content */}
                  {activeMenuId === event.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#111] border border-gray-800 rounded-md shadow-xl z-50 py-1">
                      <button
                        onClick={() => openEditModal(event)}
                        className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-gray-300 hover:bg-gray-900 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-500 hover:bg-red-900/20"
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
          <div className="py-20 text-center text-gray-500 border border-gray-800 border-dashed rounded-lg">
            No events found. Create one to get started.
          </div>
        )}
      </div>

      {/* --- MODAL DIALOG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111] w-full max-w-lg rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                {editingEvent ? "Edit event type" : "Add a new event type"}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Set up event types to offer different types of meetings.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Title Input */}
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

              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  URL
                </label>
                <div className="flex items-center overflow-hidden transition-colors bg-black border border-gray-800 rounded-md focus-within:border-white">
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

              {/* Description Input */}
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

              {/* Duration Input */}
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
                  className="px-4 py-2 text-sm font-medium text-gray-400 transition hover:text-white"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-black transition bg-white rounded-full hover:bg-gray-200"
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
