import pool from "../utils/database.js";

export const listAllActivities = async () => {
  const [rows] = await pool.query("SELECT * FROM activities");

  return rows;
};
