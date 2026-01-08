const express = require("express");
const router = express.Router();

const {
  createAvailability,
  getAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

router.post("/", createAvailability);
router.get("/", getAvailability);
router.delete("/:id", deleteAvailability);

module.exports = router;
