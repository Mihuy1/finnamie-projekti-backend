import pool from "../utils/database.js";

export const listAllActivities = async () => {
  const rows = pool.query("SELECT * FROM activities");

  return rows;
};
