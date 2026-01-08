const pool = require("../database");

/**
 * CREATE EVENT TYPE
 * -----------------
 * Creates a new meeting type (e.g., "15 Min Chat").
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, duration_minutes, slug, buffer_minutes } =
      req.body;

    if (!title || !duration_minutes || !slug) {
      return res
        .status(400)
        .json({ message: "title, duration_minutes and slug are required" });
    }

    const query = `
      INSERT INTO event_types (title, description, duration_minutes, slug, buffer_minutes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      title,
      description || null,
      duration_minutes,
      slug,
      buffer_minutes || 0,
    ];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    // Handle Duplicate Slug Error
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Event with this URL already exists" });
    }
    res.status(500).json({ message: "Failed to create event" });
  }
};

/**
 * GET ALL EVENTS
 * --------------
 * Fetches all active event types for the dashboard.
 */
const getEvents = async (req, res) => {
  try {
    const query = `
      SELECT * FROM event_types
      WHERE is_active = true
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};

/**
 * GET EVENT BY SLUG (Public)
 * --------------------------
 * Fetches a single event by its URL slug for the public booking page.
 */
const getEventBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const query = `SELECT * FROM event_types WHERE slug = $1 AND is_active = true LIMIT 1`;
    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET EVENT BY SLUG ERROR:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
};

/**
 * UPDATE EVENT
 * ------------
 * Updates details of an existing event type.
 */
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      duration_minutes,
      slug,
      buffer_minutes,
      is_active,
    } = req.body;

    const query = `
      UPDATE event_types
      SET title = $1, description = $2, duration_minutes = $3, slug = $4, buffer_minutes = $5, is_active = $6
      WHERE id = $7
      RETURNING *
    `;
    const values = [
      title,
      description || null,
      duration_minutes,
      slug,
      buffer_minutes || 0,
      is_active === undefined ? true : is_active,
      id,
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Event with this URL already exists" });
    }
    res.status(500).json({ message: "Failed to update event" });
  }
};

/**
 * DELETE EVENT
 * ------------
 * Permanently deletes an event type.
 */
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM event_types WHERE id = $1", [id]);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventBySlug,
  updateEvent,
  deleteEvent,
};
