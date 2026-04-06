import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

const listAllUsers = async () => {
  const rows = await pool.query("SELECT * FROM users WHERE status = 'active'");
  return rows;
};

const getUserByIdModel = async (id) => {
  const rows = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

  return rows[0] ?? null;
};

const getUserPublicInfoByid = async (id) => {
  const rows =
    "SELECT users.first_name, users.last_name, users.role, users.country, users.date_of_birth, users.image_url, host_profiles.city, host_profiles.description, host_profiles.experience_length FROM users LEFT JOIN host_profiles ON users.id = host_profiles.user_id WHERE users.id = ?";
  const result = await pool.query(rows, [id]);

  return result[0] ?? null;
};

const getUserProfileInfoById = async (id) => {
  const rows = await pool.query(
    "SELECT first_name, last_name, email, role, country, date_of_birth, gender, image_url FROM users WHERE id = ?",
    [id],
  );

  return rows[0];
};

const getUserImageById = async (id) => {
  const rows = await pool.query("SELECT image_url FROM users WHERE id = ?", [
    id,
  ]);
  return rows[0] ?? null;
};

const addUser = async (user) => {
  let {
    id,
    first_name,
    last_name,
    email,
    password,
    role,
    country,
    date_of_birth,
    gender,
    image_url,
    verification_token,
  } = user;

  if (!id) id = uuidv4();

  const sql = `INSERT INTO users (id, first_name, last_name, email, password, role, country, date_of_birth, gender, image_url, verification_token) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id,
    first_name,
    last_name,
    email,
    password,
    role,
    country,
    date_of_birth,
    gender,
    image_url,
    verification_token,
  ].map((value) => value ?? null);

  const rows = await pool.execute(sql, params);

  return {
    id,
    first_name,
    last_name,
    email,
    role,
    date_of_birth,
    gender,
    country,
  };
};

const modifyUser = async (id, user) => {
  const {
    first_name,
    last_name,
    email,
    password,
    role,
    country,
    date_of_birth,
    gender,
  } = user;

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

  if (role !== undefined) {
    fields.push("role = ?");
    params.push(role);
  }

  if (country !== undefined) {
    fields.push("country = ?");
    params.push(country);
  }

  if (date_of_birth !== undefined) {
    fields.push("date_of_birth = ?");
    params.push(date_of_birth);
  }

  if (gender !== undefined) {
    fields.push("gender = ?");
    params.push(gender);
  }

  if (fields.length === 0) return { affectedRows: 0 };

  params.push(id);

  const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

  const result = await pool.execute(sql, params);

  return {
    affectedRows: result.affectedRows.toString(),
  };
};

const confirmUserEmail = async (token) => {
  const sql = `UPDATE users SET is_verified = true, verification_token = null WHERE verification_token = ?`;
  const result = await pool.execute(sql, [token]);
  return result.affectedRows;
};

const getUserIsVerifiedById = async (id) => {
  const sql = `SELECT is_verified FROM users WHERE id = ?`;
  const rows = await pool.query(sql, [id]);
  return rows[0]?.is_verified ?? false;
};

const getVerificationTokenByEmail = async (email) => {
  const sql = `SELECT verification_token FROM users WHERE email = ?`;

  const rows = await pool.query(sql, [email]);

  return rows[0]?.verification_token ?? null;
};

const getUserByVerificationToken = async (token) => {
  const sql = `SELECT id, first_name, last_name, role, is_verified FROM users WHERE verification_token = ?`;
  const rows = await pool.query(sql, [token]);
  return rows[0] ?? null;
};

const getUserByEmail = async (email) => {
  const rows = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0] ?? null;
};

const removeUser = async (id) => {
  const rows = await pool.execute(
    `UPDATE users SET status = 'deleted', password = NULL WHERE id = ?`,
    [id],
  );

  return rows[0] ?? null;
};

export {
  listAllUsers,
  getUserByIdModel,
  getUserPublicInfoByid,
  addUser,
  getUserByEmail,
  modifyUser,
  confirmUserEmail,
  getVerificationTokenByEmail,
  getUserByVerificationToken,
  getUserImageById,
  getUserProfileInfoById,
  removeUser,
  getUserIsVerifiedById,
};
