import pool from "../utils/database.js";

export const getHostActivitiesByUserId = async (userId) => {
  const rows = await pool.query(
    `
    SELECT a.id, a.name
    FROM host_profiles hp
    JOIN host_profile_activities hpa ON hpa.host_profile_id = hp.id
    JOIN activities a ON a.id = hpa.activity_id
    WHERE hp.user_id = ?
    ORDER BY a.name ASC
    `,
    [userId],
  );

  return rows;
};

export const setHostActivitiesByUserId = async (userId, activityIds) => {
  const rawIds = Array.isArray(activityIds)
    ? activityIds.map((item) => {
        if (item && typeof item === "object") return item.id;
        return item;
      })
    : [];

  const ids = [
    ...new Set(
      rawIds.map((x) => Number(x)).filter((n) => Number.isInteger(n) && n > 0),
    ),
  ];

  if (
    Array.isArray(activityIds) &&
    activityIds.length > 0 &&
    ids.length === 0
  ) {
    throw new Error("Invalid activity_ids payload");
  }

  const hostProfiles = await pool.query(
    "SELECT id FROM host_profiles WHERE user_id = ?",
    [userId],
  );

  const hostProfileId = hostProfiles[0]?.id;
  if (!hostProfileId) throw new Error("Host profile not found for user_id");

  await pool.execute(
    "DELETE FROM host_profile_activities WHERE host_profile_id = ?",
    [hostProfileId],
  );

  if (ids.length === 0) return { affectedRows: 0 };

  const placeholders = ids.map(() => "(?, ?)").join(", ");
  const params = ids.flatMap((activityId) => [hostProfileId, activityId]);

  return pool.execute(
    `INSERT INTO host_profile_activities (host_profile_id, activity_id) VALUES ${placeholders}`,
    params,
  );
};
