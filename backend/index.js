const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---

const availabilityRoutes = require("./routes/availabilityRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const eventRoutes = require("./routes/eventRoutes");
const slotRoutes = require("./routes/slotRoutes");
// --- Mount Routes ---
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/slots", slotRoutes);

// --- Health Check ---
app.get("/", (req, res) => {
  res.send("Backend is running & healthy! 🚀");
});

// --- DB Check ---
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Database connected successfully");
  }
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
