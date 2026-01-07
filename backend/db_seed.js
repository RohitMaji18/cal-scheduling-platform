require("dotenv").config();
const pool = require("./database");

async function seed() {
  try {
    console.log("Running DB seed...");

    // Minimal safety: unique index to prevent identical start-time duplicates
    await pool.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_start ON bookings(event_type_id, booking_date, start_time)"
    );

    // 1) Ensure default user
    const userEmail = "owner@example.com";
    let res = await pool.query("SELECT id FROM users WHERE email = $1", [
      userEmail,
    ]);
    let userId;
    if (res.rows.length > 0) {
      userId = res.rows[0].id;
      console.log("Found user id", userId);
    } else {
      res = await pool.query(
        "INSERT INTO users(name, email) VALUES($1, $2) RETURNING id",
        ["Default User", userEmail]
      );
      userId = res.rows[0].id;
      console.log("Inserted user id", userId);
    }

    // 2) Ensure an event type
    const slug = "30-min-meeting";
    res = await pool.query("SELECT id FROM event_types WHERE slug = $1", [
      slug,
    ]);
    let eventId;
    if (res.rows.length > 0) {
      eventId = res.rows[0].id;
      console.log("Found event id", eventId);
    } else {
      res = await pool.query(
        "INSERT INTO event_types(user_id, title, description, duration_minutes, slug, buffer_minutes) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
        [userId, "30 min Meeting", "Quick sync", 30, slug, 5]
      );
      eventId = res.rows[0].id;
      console.log("Inserted event id", eventId);
    }

    // 3) Ensure availability (Monday 09:00-17:00, UTC)
    res = await pool.query(
      "SELECT id FROM availability WHERE user_id = $1 AND day_of_week = $2 AND start_time = $3 AND end_time = $4",
      [userId, 1, "09:00", "17:00"]
    );
    if (res.rows.length > 0) {
      console.log("Availability exists");
    } else {
      await pool.query(
        "INSERT INTO availability(user_id, day_of_week, start_time, end_time, timezone) VALUES($1,$2,$3,$4,$5)",
        [userId, 1, "09:00", "17:00", "UTC"]
      );
      console.log("Inserted availability");
    }

    // 4) Ensure one sample booking
    res = await pool.query(
      "SELECT id FROM bookings WHERE event_type_id = $1 AND booking_date = $2 AND start_time = $3",
      [eventId, "2026-01-10", "09:00"]
    );
    if (res.rows.length > 0) {
      console.log("Sample booking exists");
    } else {
      await pool.query(
        "INSERT INTO bookings(event_type_id, booking_date, start_time, end_time, booker_name, booker_email, status) VALUES($1,$2,$3,$4,$5,$6,$7)",
        [
          eventId,
          "2026-01-10",
          "09:00",
          "09:30",
          "Alice",
          "alice@example.com",
          "confirmed",
        ]
      );
      console.log("Inserted sample booking");
    }

    console.log("DB seed completed successfully.");
  } catch (err) {
    console.error("DB seed error:", err.message || err);
  } finally {
    await pool.end();
  }
}

seed();
