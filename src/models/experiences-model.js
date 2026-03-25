import pool from "../utils/database.js";

export const getAllExperiences = async () => {
  const rows = await pool.query("SELECT * FROM experiences");
  return rows;
};

export const getExperiencesByHostId = async (host_id) => {
  const rows = await pool.query("SELECT * FROM experiences WHERE host_id = ?", [
    host_id,
  ]);

  for (let exp of rows) {
    const activities = await pool.query(
      `SELECT a.id, a.name
       FROM timeslot_activities ta
       JOIN activities a ON a.id = ta.activity_id
       WHERE ta.experience_id = ?`,
      [exp.id],
    );

    const images = await pool.query(
      `SELECT url FROM timeslot_images WHERE experience_id = ?`,
      [exp.id],
    );

    const rule = await pool.query(
      `SELECT e.id, tr.start_date, tr.end_date, tr.start_time, tr.end_time, tr.weekdays_bitmask, tr.max_participants
      FROM timeslot_rules tr
      JOIN experiences e ON e.id = tr.experience_id
      WHERE tr.experience_id = ?`,
      exp.id,
    );

    exp.rule = rule;
    exp.images = images;
    exp.activities = activities;
  }

  return rows;
};

export const getAllExperiencesWithHost = async () => {
  const experiences = await pool.query(
    `SELECT e.*, u.first_name, u.last_name
     FROM experiences e
     JOIN users u ON e.host_id = u.id
     WHERE u.role = 'host' ORDER BY e.id DESC`,
  );

  for (let exp of experiences) {
    const activities = await pool.query(
      `SELECT a.id, a.name
       FROM timeslot_activities ta
       JOIN activities a ON a.id = ta.activity_id
       WHERE ta.experience_id = ?`,
      [exp.id],
    );

    const images = await pool.query(
      `SELECT url FROM timeslot_images WHERE experience_id = ?`,
      [exp.id],
    );

    const rule = await pool.query(
      `SELECT e.id, tr.start_date, tr.end_date, tr.start_time, tr.end_time, tr.weekdays_bitmask, tr.max_participants
      FROM timeslot_rules tr
      JOIN experiences e ON e.id = tr.experience_id
      WHERE tr.experience_id = ?`,
      exp.id,
    );

    exp.rule = rule;
    exp.images = images;
    exp.activities = activities;
  }

  return experiences;
};

export const insertExperience = async (
  conn,
  host_id,
  title,
  description,
  type,
  city,
  address,
  latitude_deg,
  longitude_deg,
) => {
  const q =
    "INSERT INTO experiences (host_id, title, description, type, city, address, latitude_deg, longitude_deg) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  const result = await conn.execute(q, [
    host_id,
    title,
    description,
    type,
    city,
    address,
    latitude_deg,
    longitude_deg,
  ]);

  return result;
};

export const removeExperience = async (host_id, experience_id) => {
  const rows = await pool.execute(
    "DELETE FROM experiences WHERE id = ? AND host_id = ?",
    [experience_id, host_id],
  );

  return rows;
};
