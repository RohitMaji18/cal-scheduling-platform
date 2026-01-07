const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./database");
const eventRoutes = require("./routes/eventRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");
const slotRoutes = require("./routes/slotRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.use("/events", eventRoutes);
app.use("/availability", availabilityRoutes);
app.use("/slots", slotRoutes);
app.use("/bookings", bookingRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
