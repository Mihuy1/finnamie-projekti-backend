import pool from "../utils/database.js";

export const updateUserImage = async (url, id) => {
  const q = "UPDATE users SET image_url = ? WHERE id = ?";
  await pool.execute(q, [url, id]);
};

export const uploadTimeSlotImages = async (urls) => {
  if (!urls.length) return;

  const placeholders = urls.map(() => "(?, ?)").join(", ");
  const flatValues = urls.flat();

  const q = `INSERT IGNORE INTO timeslot_images(url, timeslot_id) VALUES ${placeholders}`;

  await pool.query(q, flatValues);
};
