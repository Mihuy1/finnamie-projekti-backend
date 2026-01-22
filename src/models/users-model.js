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

const addUser = async (user) => {
  const { first_name, last_name, email, password, role } = user;

  const sql = `INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)`;
  const params = [first_name, last_name, email, password, role].map(
    (value) => value ?? null,
  );

  const rows = await pool.execute(sql, params);

  return {
    id: rows.insertId?.toString(),
    first_name,
    last_name,
    email,
    role,
  };
};

const getUserByEmail = async (email) => {
  const rows = pool.query(`SELECT * FROM users WHERE email = ?`, [email]);

  console.log("rows", rows);

  return rows;
};

export { listAllUsers, getUserByIdModel, addUser, getUserByEmail };
