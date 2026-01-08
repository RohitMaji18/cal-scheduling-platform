const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  deleteEvent,
  updateEvent,
  getEventBySlug,
} = require("../controllers/eventController");

router.post("/", createEvent);
router.get("/", getEvents);
router.get("/slug/:slug", getEventBySlug);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

module.exports = router;
