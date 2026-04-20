import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

export const getReservationByIdModel = async (reservation_id) => {
  const q = `SELECT * FROM reservations WHERE id = ?`;

  return await pool.query(q, [reservation_id]);
};

export const getReservationWithTimeslotByIdModel = async (reservation_id) => {
  const q = `
    SELECT r.*, t.start_time, t.end_time
    FROM reservations r
    INNER JOIN timeslot t ON r.timeslot_id = t.id
    WHERE r.id = ?
  `;

  const rows = await pool.query(q, [reservation_id]);
  return rows[0] ?? null;
};

export const reserveTimeslotModel = async (
  timeslotID,
  guestID,
  conn = pool,
) => {
  // TODO:
  // estä varaus, jos timeslotti varattu jo
  // sähköposti hostille, kun joku varaa timeslotin?
  const newReservationId = uuidv4(); // 1. Luodaan ID tässä

  const q = `INSERT INTO reservations (id, guest_id, timeslot_id, booking_status)
               VALUES (?, ?, ?, 'reserved')`;

  const params = [newReservationId, guestID, timeslotID];
  await conn.execute(q, params);

  return { id: newReservationId };
};

export const cancelReservationModel = async (id, userID) => {
  try {
    await pool.execute(`SELECT guest_id FROM reservations WHERE id = ?`, [id]);

    await pool.execute(
      `UPDATE reservations SET booking_status = 'cancelled' WHERE id = ?`,
      [id],
    );

    return { success: true };
  } catch (err) {
    console.error("VIRHE MODELISSA:", err.message);
    throw err;
  }
};

export const confirmReservationModel = async (reservation_id, hostID) => {
  try {
    const t = await pool.execute(
      `SELECT guest_id FROM reservations WHERE id = ?`,
      [reservation_id],
    );

    if (!t) return null;

    return await pool.execute(
      `UPDATE reservations SET booking_status = 'confirmed' WHERE id = ?`,
      [reservation_id],
    );
  } catch (err) {
    console.error("ConfirmReservationModel error:", err);
  }
};

export const getReservationInformationModel = async (guestID) => {
  const q = `
    SELECT 
      v.reservation_id, 
      v.booking_status, 
      v.current_status,       
      v.res_date,
      r.payment_received,
      v.timeslot_id, 
      v.start_time, 
      v.end_time,
      v.experience_id,
      v.host_id,              
      e.title,
      e.description,         
      e.address,             
      e.city,                 
      e.type AS experience_length,
      u.first_name,           
      u.last_name,
      a.name AS category,      
      img.url AS image_url,
      rev.id AS review_id,   
      rev.score,           
      rev.content,
      (
        SELECT cj1.conv_id 
        FROM conversation_join cj1
        JOIN conversation_join cj2 ON cj1.conv_id = cj2.conv_id
        WHERE cj1.user_id = v.guest_id AND cj2.user_id = v.host_id
        LIMIT 1
      ) AS conv_id          
    FROM v_reservations v
    INNER JOIN experiences e ON v.experience_id = e.id
    INNER JOIN users u ON v.host_id = u.id 
    LEFT JOIN review rev ON v.reservation_id = rev.res_id 
    LEFT JOIN activities a ON e.id = a.id  
    LEFT JOIN (
        SELECT experience_id, MIN(url) as url 
        FROM timeslot_images 
        GROUP BY experience_id
    ) img ON e.id = img.experience_id
    WHERE v.guest_id = ?
    ORDER BY v.res_date DESC
  `;

  const rows = await pool.execute(q, [guestID]);
  return rows;
};

export const getReservationsForHostModel = async (hostID) => {
  const q = `
    SELECT 
      v.reservation_id, 
      v.booking_status, 
      v.current_status,      
      v.res_date,
      v.guest_id,
      v.timeslot_id, 
      v.start_time, 
      v.end_time,
      v.experience_id,
      v.host_id,              
      e.title,
      e.description,         
      e.address,             
      e.city,                 
      e.type AS experience_length,
      guest.first_name,           
      guest.last_name,
      rev.id AS review_id,   
      rev.score,            
      rev.content,
      (
        SELECT cj1.conv_id 
        FROM conversation_join cj1
        JOIN conversation_join cj2 ON cj1.conv_id = cj2.conv_id
        WHERE cj1.user_id = v.guest_id AND cj2.user_id = v.host_id
        LIMIT 1
      ) AS conv_id         
    FROM v_reservations v
    INNER JOIN experiences e ON v.experience_id = e.id
    INNER JOIN users guest ON v.guest_id = guest.id
    LEFT JOIN review rev ON v.reservation_id = rev.res_id 
    WHERE v.host_id = ?       -- Filtering directly on the view's host_id
    ORDER BY v.res_date DESC
  `;

  const rows = await pool.execute(q, [hostID]);
  return rows;
};

export const updateReservationStatusByIdModel = async (
  reservationID,
  status,
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (status === "rejected") {
      await conn.execute(`DELETE FROM reservations WHERE id = ?`, [
        reservationID,
      ]);
    } else {
      await conn.execute(
        `UPDATE reservations SET booking_status = ? WHERE id = ?`,
        [status, reservationID],
      );
    }

    const newContent = status === "confirmed" ? "ACCEPTED" : "DECLINED";

    await conn.execute(`UPDATE messages SET content = ? WHERE content LIKE ?`, [
      newContent,
      `%ID:${reservationID}%`,
    ]);

    await conn.commit();
    return { success: true };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export const getReservationPrice = async (type) => {
  const query = "SELECT price_id FROM prices WHERE type = ?";
  const rows = await pool.execute(query, type);
  return rows[0];
};

export const setPaymentCompleted = async (res_id) => {
  const query = "UPDATE reservations SET payment_received = TRUE WHERE id = ?";
  const rows = await pool.execute(query, res_id);
};

export const getPriceData = async () => {
  const query = "SELECT * FROM prices";
  const rows = await pool.execute(query);
  return rows;
};

export const setPriceData = async (prices) => {
  const query = "UPDATE prices SET price_id = ? WHERE type = ?";
  await Promise.all(
    prices.map((price) => pool.execute(query, [price.price_id, price.type])),
  );
};

export const getAllReservationsModel = async () => {
  const query = `SELECT r.id, r.booking_status, r.res_date, r.payment_received, u.first_name, u.last_name FROM reservations r
  LEFT JOIN users u ON r.guest_id = u.id`;
  const rows = pool.execute(query);
  return rows;
};

export const markReservationsPaidModel = async (reservationIds) => {
  const query = `
    UPDATE reservations
    SET payment_received = 1
    WHERE id = ?
      AND payment_received = 0`;

  try {
    await Promise.all(reservationIds.map((id) => pool.execute(query, [id])));
  } catch (error) {
    console.error("Error updating reservations:", error);
    throw error;
  }
};
