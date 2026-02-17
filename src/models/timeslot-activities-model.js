import pool from "../utils/database.js";

export const getActivitiesByTimeslotId = async (timeslotId) => {
  return await pool.query(
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
