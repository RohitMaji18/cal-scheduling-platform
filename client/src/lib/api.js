// src/lib/api.js
import axios from "axios";

// Yaha hum check kar rahe hain:
// Agar Environment Variable set hai (Deploy hone par), toh wo use karo.
// Agar nahi hai (Laptop par), toh Localhost use karo.
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BACKEND_URL,
});

// --- Admin Functions ---
export const fetchEvents = () => api.get("/events");
export const createEvent = (data) => api.post("/events", data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const getAvailability = () => api.get("/availability");
export const updateAvailability = (data) => api.post("/availability", data);
export const getBookings = (filter) => api.get(`/bookings?filter=${filter}`);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);

// --- Public Functions ---
export const fetchEventBySlug = (slug) => api.get(`/events/slug/${slug}`);
export const fetchSlots = (eventTypeId, date) =>
  api.get(`/slots?event_type_id=${eventTypeId}&date=${date}`);
export const createBooking = (data) => api.post("/bookings", data);

export default api;
