const pool = require("../database");
const { DateTime } = require("luxon");

/**
 * GET AVAILABLE SLOTS
 * query params: event_type_id, date (YYYY-MM-DD)
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { event_type_id, date } = req.query;

    if (!event_type_id || !date) {
      return res.status(400).json({
        message: "event_type_id and date are required",
      });
    }

    // Determine day of week according to availability timezone
    // We'll fetch availability rows (which include timezone) and compute the weekday
    // from the provided date using that timezone.

    // 1. Get event details
    const eventResult = await pool.query(
      "SELECT duration_minutes, buffer_minutes FROM event_types WHERE id = $1 AND is_active = true",
      [event_type_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { duration_minutes, buffer_minutes } = eventResult.rows[0];
    const slotDuration = duration_minutes + buffer_minutes;

    // 2. Get availability for the day
    const availabilityResult = await pool.query(
      "SELECT start_time, end_time, timezone, day_of_week FROM availability"
    );

    if (availabilityResult.rows.length === 0) {
      return res.json([]);
    }

    // Find availability rows matching the weekday in their timezone
    const matchingAvailability = availabilityResult.rows.find((av) => {
      try {
        const dt = DateTime.fromISO(date, { zone: av.timezone });
        const luxonWeekday = dt.weekday; // 1 (Mon) - 7 (Sun)
        const avWeekday = av.day_of_week; // 0 (Sun) - 6 (Sat)
        const computed = luxonWeekday === 7 ? 0 : luxonWeekday; // map 7->0
        return computed === avWeekday;
      } catch (e) {
        return false;
      }
    });

    if (!matchingAvailability) return res.json([]);

    const availability = matchingAvailability;

    // Helper: time string → minutes
    const toMinutes = (time) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 + m;
    };

    const startMinutes = toMinutes(availability.start_time);
    const endMinutes = toMinutes(availability.end_time);

    let slots = [];
    for (
      let t = startMinutes;
      t + duration_minutes <= endMinutes;
      t += slotDuration
    ) {
      slots.push(t);
    }

    // 3. Get already booked slots
    const bookedResult = await pool.query(
      `
      SELECT start_time
      FROM bookings
      WHERE event_type_id = $1
        AND booking_date = $2
        AND status = 'confirmed'
    `,
      [event_type_id, date]
    );

    const bookedMinutes = bookedResult.rows.map((b) => toMinutes(b.start_time));

    // 4. Remove booked slots
    const availableSlots = slots.filter(
      (slot) => !bookedMinutes.includes(slot)
    );

    // Convert minutes → HH:MM
    const formatTime = (mins) => {
      const h = String(Math.floor(mins / 60)).padStart(2, "0");
      const m = String(mins % 60).padStart(2, "0");
      return `${h}:${m}`;
    };

    res.json(availableSlots.map(formatTime));
  } catch (error) {
    console.error("SLOT ERROR:", error);
    res.status(500).json({ message: "Failed to get slots" });
  }
};

module.exports = { getAvailableSlots };
