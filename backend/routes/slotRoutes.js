const express = require("express");
const router = express.Router();

const { getAvailableSlots } = require("../controllers/slotController");

// Get available slots
router.get("/", getAvailableSlots);

module.exports = router;
