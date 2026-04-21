import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

const listAllReviews = async () => {
  const rows = await pool.query("SELECT * FROM review");

  console.log("rows:", rows);
  return rows;
};

const getReviewByHostId = async (hostId) => {
  const rows = await pool.query("SELECT * FROM review WHERE host_id = ?", [
    hostId,
  ]);

  return rows;
};

const getReviewByGuestId = async (guestId) => {
  const rows = await pool.query("SELECT * FROM review WHERE guest_id = ?", [
    guestId,
  ]);

  return rows;
};

const findReviewByExperienceId = async (experience_id) => {
  const sql = `
  SELECT 
  r.id AS review_id,
  r.content,
  r.score,
  r.created_at,
  u.first_name AS reviewer_name,
  u.image_url AS reviewer_image
  FROM review r
  JOIN reservations res ON r.res_id = res.id
  JOIN timeslot t ON res.timeslot_id = t.id
  JOIN users u ON r.guest_id = u.id
  WHERE t.experience_id = ?
  ORDER BY r.created_at DESC
  `;

  const rows = await pool.execute(sql, [experience_id]);
  return rows;
};

const postReviewModel = async (review, guestId) => {
  const { hostId, resId, content, score } = review;
  const query = `INSERT INTO review (id, host_id, res_id, guest_id, content, score)
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [uuidv4(), hostId, resId, guestId, content, score];
  await pool.execute(query, params);
};

const updateReviewModel = async (review) => {
  const { review_id, content, score } = review;
  const query = `UPDATE review SET content = ?, score = ? WHERE id = ?`;
  const params = [content, score, review_id];
  await pool.execute(query, params);
};

export {
  listAllReviews,
  getReviewByHostId,
  getReviewByGuestId,
  findReviewByExperienceId,
  postReviewModel,
  updateReviewModel,
};
