import pool from "../utils/database.js";

const listAllUsers = async () => {
  const [rows] = await pool.query("SELECT * FROM users");
  console.log("rows", rows);
  return rows;
};

const getUserByIdModel = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  console.log("rows", rows);

  return rows;
};

export { listAllUsers, getUserByIdModel };
