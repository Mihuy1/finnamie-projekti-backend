import pool from "../utils/database.js";

export const getActivitiesByTimeslotId = async (timeslotId) => {
  return await pool.execute(
    `
    SELECT a.id, a.name
    FROM timeslot_activities ta
    JOIN activities a ON a.id = ta.activity_id
    WHERE ta.timeslot_id = ?
    ORDER BY a.name ASC
    `,
    [timeslotId],
  );
};

export const getActivityUsageCount = async (activityId) => {
  const sql = `
              SELECT COUNT(*) AS usage_count
              FROM timeslot_activities
              WHERE activity_id = ?`;

  const [rows] = await pool.query(sql, [activityId]);

  return Number(rows?.usage_count ?? 0);
};

export const getActivitiesByExperienceId = async (
  experienceId,
  conn = pool,
) => {
  const rows = await conn.query(
    `SELECT a.id, a.name
     FROM timeslot_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.experience_id = ?
     ORDER BY a.name ASC`,
    [experienceId],
  );

  return rows;
};

export const setActivitiesForTimeslot = async (timeslotId, activityIds) => {
  const ids = Array.isArray(activityIds)
    ? activityIds
        .map((x) => Number(x))
        .filter((n) => Number.isInteger(n) && n > 0)
    : [];

  // Delete existing activities for this timeslot
  await pool.execute("DELETE FROM timeslot_activities WHERE timeslot_id = ?", [
    timeslotId,
  ]);

  if (ids.length === 0) return { affectedRows: 0 };

  // Insert new activities
  const placeholders = ids.map(() => "(?, ?)").join(", ");
  const params = ids.flatMap((activityId) => [timeslotId, activityId]);

  return pool.execute(
    `INSERT INTO timeslot_activities (timeslot_id, activity_id) VALUES ${placeholders}`,
    params,
  );
};

export const insertTimeslotActivitiesExperience = async (
  conn = pool,
  experienceId,
  activityIds,
) => {
  const ids = Array.isArray(activityIds)
    ? activityIds
        .map((x) => Number(x))
        .filter((n) => Number.isInteger(n) && n > 0)
    : [];

  await conn.execute(
    "DELETE FROM timeslot_activities WHERE experience_id = ?",
    [experienceId],
  );

  if (ids.length === 0) return { affectedRows: 0 };

  // Insert new activities
  const placeholders = ids.map(() => "(?, ?)").join(", ");
  const params = ids.flatMap((activityId) => [experienceId, activityId]);

  const result = await conn.execute(
    `INSERT INTO timeslot_activities (experience_id, activity_id) VALUES ${placeholders}`,
    params,
  );

  return result;
};
