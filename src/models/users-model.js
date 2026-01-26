import pool from "../utils/database.js";

const listAllUsers = async () => {
  const rows = await pool.query("SELECT * FROM users");
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

const modifyUser = async (id, user) => {
  const { first_name, last_name, email, password } = user;

  const fields = [];
  const params = [];

  if (first_name !== undefined) {
    fields.push("first_name = ?");
    params.push(first_name);
  }
  if (last_name !== undefined) {
    fields.push("last_name = ?");
    params.push(last_name);
  }
  if (email !== undefined) {
    fields.push("email = ?");
    params.push(email);
  }
  if (password !== undefined) {
    fields.push("password = ?");
    params.push(password);
  }

  if (fields.length === 0) return { affectedRows: 0 };

  params.push(id);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

  const [result] = await pool.execute(sql, params);

  return result;
};

const getUserByEmail = async (email) => {
  const rows = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0] ?? null;
};

export { listAllUsers, getUserByIdModel, addUser, getUserByEmail, modifyUser };
