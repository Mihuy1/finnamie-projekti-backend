import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

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

const getUserPublicInfoByid = async (id) => {
  const rows = await pool.query(
    "SELECT first_name, last_name FROM users WHERE id = ?",
    [id],
  );

  return rows[0] ?? null;
};

const getUserProfileInfoById = async (id) => {
  const rows = await pool.query(
    "SELECT first_name, last_name, email, role, country, date_of_birth, image_url FROM users WHERE id = ?",
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
    image_url,
  } = user;

  if (!id) id = uuidv4();

  const sql = `INSERT INTO users (id, first_name, last_name, email, password, role, country, date_of_birth, image_url) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id,
    first_name,
    last_name,
    email,
    password,
    role,
    country,
    date_of_birth,
    image_url,
  ].map((value) => value ?? null);

  const rows = await pool.execute(sql, params);

  return {
    id,
    first_name,
    last_name,
    email,
    role,
    date_of_birth,
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

export {
  listAllUsers,
  getUserByIdModel,
  getUserPublicInfoByid,
  addUser,
  getUserByEmail,
  modifyUser,
  getUserImageById,
  getUserProfileInfoById,
};
