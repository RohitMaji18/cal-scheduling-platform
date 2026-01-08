const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Booking route working ✅" });
});

router.post("/", (req, res) => {
  res.json({ message: "Create booking working ✅" });
});

router.delete("/:id", (req, res) => {
  res.json({ message: "Cancel booking working ✅" });
});

module.exports = router;
