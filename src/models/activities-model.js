import pool from "../utils/database.js";

export const listAllActivities = async () => {
  const rows = pool.query("SELECT * FROM activities");
  return rows;
};

export const getActivityByName = async (name) => {
  const rows = await pool.query("SELECT * FROM activities WHERE name = ?", [
    name,
  ]);

  return rows;
};

export const createActivity = async (name) => {
  const q = "INSERT INTO activities (name) VALUES (?)";

  const rows = await pool.query(q, [name]);

  return rows;
};

export const deleteActivity = async (id) => {
  const q = "DELETE FROM activities WHERE id = ?";

  const result = await pool.query(q, [id]);

  return result.affectedRows;
};

export const putActivity = async (id, name) => {
  const q = "UPDATE activities SET name = ? WHERE id = ?";

  const result = await pool.query(q, [name, id]);

  return result.affectedRows;
};
