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
  const q = `INSERT INTO reservations (id, guest_id, timeslot_id, booking_status)
               VALUES (?, ?, ?, 'reserved')`;
  const params = [uuidv4(), guestID, timeslotID];
  const result = await conn.execute(q, params);

  return result;
};

// hostille oma perumismahdollisuus?
export const cancelReservationModel = async (timeslotID, guestID) => {
  try {
    const savedGuestID = await pool.execute(
      `SELECT guest_id FROM reservations WHERE timeslot_id = ?`,
      [timeslotID],
    );
    if (savedGuestID.length === 0) throw new Error("Invalid timeslot_id.");
    if (guestID === savedGuestID[0].guest_id) {
      await pool.execute(
        `UPDATE reservations SET booking_status = 'cancelled' WHERE timeslot_id = ?`,
        [timeslotID],
      );
      return;
    }
    throw new Error("The guest does not own this reservation.");
  } catch (err) {
    throw new Error(err.message);
  }
};

export const confirmReservationModel = async (timeslotID, hostID) => {
  // TODO:
  // sähköposti hostille, kun joku peruu timeslotin?
  // varmista, että hosti omistaa timeslotin
  const ownedTimeslots = await pool.execute(
    "SELECT id FROM timeslot WHERE host_id = ?",
    [hostID],
  );
  const IDs = ownedTimeslots.map((timeslot) => timeslot.id);
  if (IDs.includes(timeslotID)) {
    const q = `UPDATE reservations SET booking_status = 'confirmed' WHERE timeslot_id = ?`;
    await pool.execute(q, timeslotID);
    return;
  }
  throw new Error("Host doesn't own timeslot.");
};

export const getReservationInformationModel = async (guestID) => {
  // pitää tehdä näin, koska useassa taulukoissa id sarake

  const q = `SELECT r.id AS reservation_id, r.guest_id, r.booking_status, r.res_date,
             t.id AS timeslot_id, t.host_id, t.type, t.created_at, t.start_time, t.end_time, 
             t.res_status, t.description, t.city, t.address, 
             rev.content AS content, rev.score AS score, rev.id AS review_id
             FROM reservations r
             INNER JOIN timeslot t
             ON r.timeslot_id = t.id
             LEFT JOIN review rev
             ON rev.res_id = r.id
             WHERE r.guest_id = ?
             ORDER BY r.res_date DESC`;
  const rows = await pool.execute(q, [guestID]);
  return rows;
};
