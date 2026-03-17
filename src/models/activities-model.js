import pool from "../utils/database.js";

export const listAllActivities = async () => {
  const rows = pool.query("SELECT * FROM activities");

  return rows;
};

export const getActivityByName = async (conn = pool, name) => {
  const rows = await conn.query("SELECT * FROM activities WHERE name = ?", [
    name,
  ]);

  return rows;
};

export const createActivity = async (conn = pool, name) => {
  const q = "INSERT INTO activities (name) VALUES (?)";

  const rows = await conn.query(q, [name]);

  return rows.affectedRows;
};

export const deleteActivity = async (id) => {
  const q = "DELETE FROM activities WHERE id = ?";

  const result = await pool.query(q, [id]);

  return result.affectedRows;
};
