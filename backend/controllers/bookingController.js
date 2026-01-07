const pool = require("../database");

/**
 * CREATE BOOKING
 * table: bookings
 */
const createBooking = async (req, res) => {
  try {
    const {
      event_type_id,
      booking_date,
      start_time,
      end_time,
      booker_name,
      booker_email,
    } = req.body;

    if (
      !event_type_id ||
      !booking_date ||
      !start_time ||
      !end_time ||
      !booker_name ||
      !booker_email
    ) {
      return res.status(400).json({
        message: "All booking fields are required",
      });
    }

    // Prevent overlapping bookings for the same event/date
    const overlapCheckQuery = `
      SELECT 1 FROM bookings
      WHERE event_type_id = $1
        AND booking_date = $2
        AND status = 'confirmed'
        AND NOT (end_time <= $3 OR start_time >= $4)
      LIMIT 1
    `;

    const overlapResult = await pool.query(overlapCheckQuery, [
      event_type_id,
      booking_date,
      start_time,
      end_time,
    ]);

    if (overlapResult.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "This time range overlaps an existing booking" });
    }

    const query = `
      INSERT INTO bookings
      (event_type_id, booking_date, start_time, end_time, booker_name, booker_email, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      event_type_id,
      booking_date,
      start_time,
      end_time,
      booker_name,
      booker_email,
      "confirmed",
    ];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    // double booking (unique constraint)
    if (error.code === "23505") {
      return res.status(409).json({
        message: "This time slot is already booked",
      });
    }

    res.status(500).json({
      message: "Failed to create booking",
    });
  }
};

/**
 * GET ALL BOOKINGS (Dashboard)
 */
const getBookings = async (req, res) => {
  try {
    const { filter } = req.query; // optional: upcoming | past

    let baseQuery = `
      SELECT 
        b.*,
        e.title AS event_title
      FROM bookings b
      JOIN event_types e ON b.event_type_id = e.id
    `;

    if (filter === "upcoming") {
      baseQuery += " WHERE booking_date >= CURRENT_DATE ";
    } else if (filter === "past") {
      baseQuery += " WHERE booking_date < CURRENT_DATE ";
    }

    baseQuery += " ORDER BY booking_date DESC, start_time";

    const result = await pool.query(baseQuery);
    res.json(result.rows);
  } catch (error) {
    console.error("GET BOOKINGS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
};

/**
 * CANCEL BOOKING
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = $1", [
      id,
    ]);

    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    res.status(500).json({
      message: "Failed to cancel booking",
    });
  }
};

module.exports = {
  createBooking,
  getBookings,
  cancelBooking,
};
