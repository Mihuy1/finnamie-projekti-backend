import pool from "../utils/database.js";

export const getTimeslotRuleByHostId = async (host_id) => {
  const rows = await pool.query(
    "SELECT * FROM timeslot_rules WHERE host_id = ?",
    [host_id],
  );

  return rows;
};

export const getTimeslotRuleByExperienceId = async (experience_id) => {
  const rows = await pool.query(
    "SELECT * FROM timeslot_rules where experience_id = ?",
    [experience_id],
  );

  return rows;
};

export const insertTimeslotRule = async (
  conn = pool,
  host_id,
  experience_id,
  start_date,
  end_date,
  start_time,
  end_time,
  weekdays_bitmask,
  max_participants,
) => {
  const result = await conn.execute(
    `INSERT INTO timeslot_rules (host_id, experience_id, start_date, end_date, start_time, end_time, weekdays_bitmask, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      host_id,
      experience_id,
      start_date,
      end_date,
      start_time,
      end_time,
      weekdays_bitmask,
      max_participants,
    ],
  );

  console.log("createTimeslotRule rows:", result);

  return result;
};
