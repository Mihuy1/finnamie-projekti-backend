import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

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

    console.log("T:", t);

    if (!t) return null;

    console.log("through");

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
      r.id AS reservation_id, 
      r.booking_status, 
      r.res_date,
      t.id AS timeslot_id, 
      t.start_time, 
      t.end_time,
      e.id AS experience_id,
      e.host_id,              
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
        WHERE cj1.user_id = r.guest_id AND cj2.user_id = e.host_id
        LIMIT 1
      ) AS conv_id          
    FROM reservations r
    INNER JOIN timeslot t ON r.timeslot_id = t.id
    INNER JOIN experiences e ON t.experience_id = e.id
    INNER JOIN users u ON e.host_id = u.id 
    LEFT JOIN review rev ON r.id = rev.res_id 
    LEFT JOIN activities a ON e.id = a.id  
    LEFT JOIN (
        SELECT experience_id, MIN(url) as url 
        FROM timeslot_images 
        GROUP BY experience_id
    ) img ON e.id = img.experience_id
    WHERE r.guest_id = ?
    ORDER BY r.res_date DESC
  `;

  const rows = await pool.execute(q, [guestID]);
  return rows;
};

export const getReservationsForHostModel = async (hostID) => {
  const q = `
    SELECT 
      r.id AS reservation_id, 
      r.booking_status, 
      r.res_date,
      r.guest_id,
      t.id AS timeslot_id, 
      t.start_time, 
      t.end_time,
      e.id AS experience_id,
      e.host_id,              
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
        WHERE cj1.user_id = r.guest_id AND cj2.user_id = e.host_id
        LIMIT 1
      ) AS conv_id         
    FROM reservations r
    INNER JOIN timeslot t ON r.timeslot_id = t.id
    INNER JOIN experiences e ON t.experience_id = e.id
    INNER JOIN users guest ON r.guest_id = guest.id
    LEFT JOIN review rev ON r.id = rev.res_id 
    WHERE e.host_id = ? 
    ORDER BY r.res_date DESC
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
  console.log(rows);
};
