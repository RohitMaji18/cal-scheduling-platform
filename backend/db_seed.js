require("dotenv").config();
const pool = require("./database");

async function seed() {
  try {
    console.log("🌱 Starting Database Seed...");

    // --- 1. Create Default Event Type ("30 Min Meeting") ---
    const eventSlug = "30-min-meeting";
    let eventId;

    // Check if event already exists
    const eventCheck = await pool.query(
      "SELECT id FROM event_types WHERE slug = $1",
      [eventSlug]
    );

    if (eventCheck.rows.length > 0) {
      eventId = eventCheck.rows[0].id;
      console.log(`🔹 Event '${eventSlug}' already exists (ID: ${eventId})`);
    } else {
      // Create new event
      const newEvent = await pool.query(
        `INSERT INTO event_types (title, description, duration_minutes, slug, buffer_minutes, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        ["30 Min Meeting", "A quick video call.", 30, eventSlug, 5, true]
      );
      eventId = newEvent.rows[0].id;
      console.log(`✅ Created Event: '${eventSlug}' (ID: ${eventId})`);
    }

    // --- 2. Set Default Availability (Monday 9am - 5pm) ---
    // Check if Monday (day_of_week = 1) exists
    const availCheck = await pool.query(
      "SELECT id FROM availability WHERE day_of_week = $1 AND start_time = $2",
      [1, "09:00"]
    );

    if (availCheck.rows.length > 0) {
      console.log("🔹 Availability for Monday already exists");
    } else {
      // Create availability
      await pool.query(
        `INSERT INTO availability (day_of_week, start_time, end_time, timezone)
         VALUES ($1, $2, $3, $4)`,
        [1, "09:00", "17:00", "UTC"]
      );
      console.log("✅ Set Availability: Monday 09:00 - 17:00 UTC");
    }

    // --- 3. Create Sample Booking ---
    const bookingDate = "2026-02-20"; // Future date
    const bookingCheck = await pool.query(
      "SELECT id FROM bookings WHERE event_type_id = $1 AND booking_date = $2 AND start_time = $3",
      [eventId, bookingDate, "10:00"]
    );

    if (bookingCheck.rows.length > 0) {
      console.log("🔹 Sample booking already exists");
    } else {
      // Create booking
      await pool.query(
        `INSERT INTO bookings (event_type_id, booking_date, start_time, end_time, booker_name, booker_email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          eventId,
          bookingDate,
          "10:00",
          "10:30",
          "Alice",
          "alice@example.com",
          "confirmed",
        ]
      );
      console.log(`✅ Created Sample Booking for ${bookingDate}`);
    }

    console.log("✨ Database seed completed successfully!");
  } catch (err) {
    console.error("❌ Seed Error:", err.message || err);
  } finally {
    await pool.end(); // Close DB connection
  }
}

seed();
