import pool from "../utils/database.js";

const listAllUsers = async () => {
  const rows = await pool.query("SELECT * FROM users");
  console.log("rows", rows);
  return rows;
};

const getUserByIdModel = async (id) => {
  const rows = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  console.log("rows", rows);

  return rows[0] ?? null;
};

const addUser = async (user) => {
  const {
    id,
    first_name,
    last_name,
    email,
    password,
    role,
    image_url,
    description,
  } = user;

  const sql = `INSERT INTO users (id, first_name, last_name, email, password, role, image_url, description) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id,
    first_name,
    last_name,
    email,
    password,
    role,
    image_url,
    description,
  ].map((value) => value ?? null);

  const rows = await pool.execute(sql, params);

  return {
    id,
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

  const result = await pool.execute(sql, params);

  return {
    affectedRows: result.affectedRows.toString(),
  };
};

const getUserByEmail = async (email) => {
  const rows = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0] ?? null;
};

export { listAllUsers, getUserByIdModel, addUser, getUserByEmail, modifyUser };
