const express = require("express");
const router = express.Router();

const {
  createAvailability,
  getAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

// Set availability
router.post("/", createAvailability);

// Get availability
router.get("/", getAvailability);

// Delete availability
router.delete("/:id", deleteAvailability);

module.exports = router;
