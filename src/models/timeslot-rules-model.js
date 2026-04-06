import pool from "../utils/database.js";

export const getTimeslotRuleByHostId = async (host_id) => {
  const rows = await pool.query(
    "SELECT * FROM timeslot_rules WHERE host_id = ?",
    [host_id],
  );

  return rows;
};

export const getTimeslotRuleById = async (id) => {
  const rows = await pool.query("SELECT * FROM timeslot_rules WHERE id = ?", [
    id,
  ]);

  return rows[0] ?? null;
};

export const getTimeslotRuleByExperienceId = async (experience_id) => {
  const rows = await pool.query(
    "SELECT * FROM timeslot_rules where experience_id = ?",
    [experience_id],
  );

  return rows;
};

export const getRuleByExperienceId = async (experience_id, conn = pool) => {
  const rows = await conn.query(
    `SELECT tr.id as rule_id, tr.start_date, tr.end_date, tr.start_time, tr.end_time,
            tr.weekdays_bitmask, tr.max_participants
     FROM timeslot_rules tr
     WHERE tr.experience_id = ?`,
    [experience_id],
  );

  return rows[0] ?? null;
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

  return result;
};

export const putTimeslotRule = async (conn = pool, id, data) => {
  const fields = { ...data };

  const allowed = [
    "start_date",
    "end_date",
    "start_time",
    "end_time",
    "weekdays_bitmask",
    "max_participants",
  ];

  const params = [];
  const setClauses = [];

  for (const [key, rawVal] of Object.entries(fields)) {
    if (!allowed.includes(key)) continue;

    let val = rawVal;

    setClauses.push(`${key} = ?`);
    params.push(val);
  }

  const q = `UPDATE timeslot_rules SET ${setClauses.join(", ")} WHERE experience_id = ?`;

  params.push(id);

  await conn.execute(q, params);

  const rows = await conn.execute(
    `SELECT * FROM timeslot_rules WHERE experience_id = ?`,
    [id],
  );

  return rows[0] ?? null;
};
