const pool = require("../database");
const { DateTime } = require("luxon");

/**
 * GET AVAILABLE SLOTS
 * -------------------
 * Calculates free time slots for a given date and event type.
 * Query Params: event_type_id, date (YYYY-MM-DD)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { event_type_id, date } = req.query;

    if (!event_type_id || !date) {
      return res
        .status(400)
        .json({ message: "event_type_id and date are required" });
    }

    // 1. Fetch Event Details (Duration & Buffer)
    const eventResult = await pool.query(
      "SELECT duration_minutes, buffer_minutes FROM event_types WHERE id = $1 AND is_active = true",
      [event_type_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { duration_minutes, buffer_minutes } = eventResult.rows[0];
    const totalSlotDuration = duration_minutes + buffer_minutes;

    // 2. Fetch Availability Rules (Working Hours)
    const availabilityResult = await pool.query(
      "SELECT start_time, end_time, timezone, day_of_week FROM availability"
    );

    // 3. Match Date to Availability Rule
    // We need to check which availability rule applies to the requested date
    // considering the timezone stored in the rule.
    const matchingAvailability = availabilityResult.rows.find((av) => {
      try {
        const dt = DateTime.fromISO(date, { zone: av.timezone });
        const luxonWeekday = dt.weekday; // Luxon: 1 (Mon) - 7 (Sun)
        const avWeekday = av.day_of_week; // DB: 0 (Sun) - 6 (Sat)

        // Convert Luxon Sunday (7) to DB Sunday (0)
        const computed = luxonWeekday === 7 ? 0 : luxonWeekday;

        return computed === avWeekday;
      } catch (e) {
        return false;
      }
    });

    // If no availability rule matches this day, return empty slots
    if (!matchingAvailability) return res.json([]);

    // 4. Generate All Possible Time Slots
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(matchingAvailability.start_time);
    const endMinutes = toMinutes(matchingAvailability.end_time);

    let potentialSlots = [];
    for (
      let t = startMinutes;
      t + duration_minutes <= endMinutes;
      t += totalSlotDuration
    ) {
      potentialSlots.push(t);
    }

    // 5. Fetch Existing Bookings for that Day
    const bookedResult = await pool.query(
      `SELECT start_time FROM bookings 
       WHERE event_type_id = $1 AND booking_date = $2 AND status = 'confirmed'`,
      [event_type_id, date]
    );

    const bookedTimesInMinutes = bookedResult.rows.map((b) =>
      toMinutes(b.start_time)
    );

    // 6. Filter Out Booked Slots
    const freeSlots = potentialSlots.filter(
      (slot) => !bookedTimesInMinutes.includes(slot)
    );

    // 7. Format Slots back to "HH:MM"
    const formatTime = (mins) => {
      const h = String(Math.floor(mins / 60)).padStart(2, "0");
      const m = String(mins % 60).padStart(2, "0");
      return `${h}:${m}`;
    };

    res.json(freeSlots.map(formatTime));
  } catch (error) {
    console.error("SLOT CALCULATION ERROR:", error);
    res.status(500).json({ message: "Failed to get available slots" });
  }
};

module.exports = { getAvailableSlots };
