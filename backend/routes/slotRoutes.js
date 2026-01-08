const express = require("express");
const router = express.Router();

const { getAvailableSlots } = require("../controllers/slotController");

router.get("/", getAvailableSlots);

module.exports = router;
