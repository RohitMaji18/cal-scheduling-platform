const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookings,
  cancelBooking,
} = require("../controllers/bookingController");

// Public booking
router.post("/", createBooking);

// Admin dashboard - list bookings
router.get("/", getBookings);

// Cancel booking
router.delete("/:id", cancelBooking);

module.exports = router;
