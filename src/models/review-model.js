import pool from "../utils/database.js";

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

export { listAllReviews, getReviewByHostId, getReviewByGuestId };
