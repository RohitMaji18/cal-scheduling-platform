// src/lib/api.js
import axios from "axios";

// Backend ka address (Make sure backend chal raha ho port 5000 pe)
const api = axios.create({
  baseURL: "http://localhost:5000",
});

// --- Admin Functions ---

// Saare Event Types lao (Dashboard ke liye)
export const fetchEvents = () => api.get("/events");

// Naya Event banao
export const createEvent = (data) => api.post("/events", data);

// Event delete karo
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Availability (Working Hours) lao
export const getAvailability = () => api.get("/availability");

// Availability set karo
export const updateAvailability = (data) => api.post("/availability", data);

// Bookings ki list lao
export const getBookings = (filter) => api.get(`/bookings?filter=${filter}`);

// Booking cancel karo
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);

// --- Public Functions (Jo log book karenge unke liye) ---

// Public link se Event ki details lao (e.g. /30-min-chat)
export const fetchEventBySlug = (slug) => api.get(`/events/slug/${slug}`);

// Available Time Slots lao (Date select karne par)
export const fetchSlots = (eventTypeId, date) =>
  api.get(`/slots?event_type_id=${eventTypeId}&date=${date}`);

// Final Booking confirm karo
export const createBooking = (data) => api.post("/bookings", data);

export default api;
