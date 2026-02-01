import pool from "../utils/database.js";

const listAllTimeslot = async () => {
  const rows = await pool.query("SELECT * FROM timeslot");
  return rows;
};

const timeslotById = async (id) => {
  return await pool.query("SELECT * FROM timeslot WHERE id = ?", [id]);
};

export { listAllTimeslot, timeslotById };
