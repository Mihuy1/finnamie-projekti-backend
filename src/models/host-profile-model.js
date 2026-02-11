import pool from "../utils/database.js";

export const getHostProfileUserId = async (userId) => {
  const rows = await pool.query(
    "SELECT * FROM host_profiles WHERE user_id = ?",
    [userId],
  );

  return rows[0];
};

export const addHostProfileByUserId = async (userId, profile) => {
  const {
    phone_number,
    street_address,
    postal_code,
    city,
    description,
    experience_length,
  } = profile;

  const sql = `INSERT INTO host_profiles (
  user_id,
  phone_number,
  street_address,
  postal_code,
  city,
  description,
  experience_length) VALUES (?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    userId,
    phone_number,
    street_address,
    postal_code,
    city,
    description,
    experience_length,
  ].map((v) => v ?? null);

  return pool.execute(sql, params);
};

export const modifyHostProfileByUserId = async (userId, profile) => {
  const fields = [];
  const params = [];

  const allowed = [
    "phone_number",
    "street_address",
    "postal_code",
    "city",
    "description",
    "experience_length",
  ];

  for (const key of allowed) {
    if (profile[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(profile[key]);
    }
  }

  if (fields.length === 0) return { affectedRows: 0 };

  params.push(userId);

  const sql = `UPDATE host_profiles SET ${fields.join(", ")} WHERE user_id = ?`;
  return pool.execute(sql, params);
};
