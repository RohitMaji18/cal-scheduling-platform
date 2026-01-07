const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
  getEventBySlug,
} = require("../controllers/eventController");

// Create event
router.post("/", createEvent);

// Get all events
router.get("/", getEvents);

// Public: get event by slug
router.get("/slug/:slug", getEventBySlug);

// Delete event
router.delete("/:id", deleteEvent);

// Update event
router.put("/:id", updateEvent);

module.exports = router;
