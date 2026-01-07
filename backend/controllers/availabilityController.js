const pool = require("../database");

/**
 * SET AVAILABILITY (CREATE)
 * table: availability
 */
const createAvailability = async (req, res) => {
  try {
    const { day_of_week, start_time, end_time, timezone } = req.body;

    // basic validation
    if (day_of_week === undefined || !start_time || !end_time || !timezone) {
      return res.status(400).json({
        message: "day_of_week, start_time, end_time, timezone are required",
      });
    }

    if (day_of_week < 0 || day_of_week > 6) {
      return res.status(400).json({
        message: "day_of_week must be between 0 (Sun) and 6 (Sat)",
      });
    }

    if (start_time >= end_time) {
      return res.status(400).json({
        message: "start_time must be before end_time",
      });
    }

    const query = `
      INSERT INTO availability
      (day_of_week, start_time, end_time, timezone)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [day_of_week, start_time, end_time, timezone];

    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE AVAILABILITY ERROR:", error);

    res.status(500).json({
      message: "Failed to set availability",
    });
  }
};

/**
 * GET ALL AVAILABILITY
 * table: availability
 */
const getAvailability = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM availability
      ORDER BY day_of_week, start_time
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("GET AVAILABILITY ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch availability",
    });
  }
};

/**
 * DELETE AVAILABILITY
 * table: availability
 */
const deleteAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM availability WHERE id = $1", [id]);

    res.json({
      message: "Availability removed successfully",
    });
  } catch (error) {
    console.error("DELETE AVAILABILITY ERROR:", error);

    res.status(500).json({
      message: "Failed to delete availability",
    });
  }
};

module.exports = {
  createAvailability,
  getAvailability,
  deleteAvailability,
};
