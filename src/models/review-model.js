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
  postReviewModel,
  updateReviewModel,
};
