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

export const uploadTimeSlotImagesExperience = async (conn = pool, urls) => {
  if (!urls.length) return;

  const placeholders = urls.map(() => "(?, ?)").join(", ");
  const flatValues = urls.flat();

  const q = `INSERT IGNORE INTO timeslot_images(url, experience_id) VALUES ${placeholders}`;

  console.log("flatValues:", flatValues);

  const result = await conn.query(q, flatValues);

  console.log("uploadTimeSlotImagesExperience result:", result);

  return result;
};

export const deleteTimeslotImages = async (id) => {
  const q = "DELETE FROM timeslot_images WHERE timeslot_id = ?";
  const { affectedRows } = await pool.execute(q, [id]);
  return affectedRows;
};

export const deleteImageByTimeslotIdAndURL = async (id, url) => {
  const q = "DELETE FROM timeslot_images WHERE timeslot_id = ? AND url = ?";
  const { affectedRows } = await pool.execute(q, [id, url]);
  return affectedRows;
};

export const deleteImageByExperienceIdAndURL = async (id, url) => {
  const q = "DELETE FROM timeslot_images WHERE experience_id = ? AND url = ?";
  const result = await pool.execute(q, [id, url]);

  return result.affectedRows;
};

export const getTimeslotImageURLs = async (id) => {
  return await pool.execute(
    "SELECT url FROM timeslot_images WHERE timeslot_id = ?",
    [id],
  );
};

export const getExperienceImageURLs = async (id) => {
  return await pool.execute(
    "SELECT url FROM timeslot_images WHERE experience_id = ?",
    [id],
  );
};
