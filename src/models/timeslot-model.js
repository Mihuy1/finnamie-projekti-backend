import pool from "../utils/database.js";
import { getTimeslotImageURLs } from "./upload-model.js";

const listAllTimeslot = async () => {
  const rows = await pool.query("SELECT * FROM timeslot");
  return rows;
};

const timeslotById = async (id) => {
  const timeslot = await pool.query("SELECT * FROM timeslot WHERE id = ?", [
    id,
  ]);

  if (timeslot.length === 0) return [];

  // Get associated activities
  const activities = await pool.query(
    `SELECT a.id, a.name
     FROM timeslot_activities ta
     JOIN activities a ON a.id = ta.activity_id
     WHERE ta.timeslot_id = ?`,
    [id],
  );

  return [
    {
      ...timeslot[0],
      activities: activities,
    },
  ];
};

// varmaan turha
const timeslotHistory = async (id) => {
  return await pool.query(
    "SELECT * FROM timeslot WHERE host_id = ? AND end_time < NOW()",
    [id],
  );
};

const attachActivitiesAndImages = async (timeslots) => {
  if (!Array.isArray(timeslots) || timeslots.length === 0) {
    return [];
  }

  const ids = timeslots.map((t) => t.id);
  const allActivities = await pool.query(
    `SELECT ta.timeslot_id, a.id, a.name
    FROM timeslot_activities ta
    JOIN activities a ON a.id = ta.activity_id
    WHERE ta.timeslot_id IN (?)`,
    [ids],
  );

  const allImages = await pool.query(
    `SELECT timeslot_id, url FROM timeslot_images WHERE timeslot_id IN (?)`,
    [ids],
  );

  return timeslots.map((t) => ({
    ...t,
    activities: allActivities
      .filter((a) => a.timeslot_id === t.id)
      .map((a) => ({ id: a.id, name: a.name })),
    images: allImages
      .filter((img) => img.timeslot_id === t.id)
      .map((img) => ({ url: img.url })),
  }));
};

const getOwnedTimeslots = async (id) => {
  const rows = await pool.query(
    "SELECT * FROM timeslot WHERE host_id = ? ORDER BY start_time ASC",
    [id],
  );
  return attachActivitiesAndImages(rows);
};

const getAvailableTimeslots = async () => {
  return await pool.query(
    "SELECT * FROM timeslot WHERE res_status = 'available'",
  );
};

const addTimeSlot = async (timeslot) => {
  const q = `INSERT INTO timeslot(id, host_id, type, start_time, end_time, description,
                          city, latitude_deg, longitude_deg, address, res_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const {
    id,
    host_id,
    type,
    start_time,
    end_time,
    description,
    city,
    latitude_deg,
    longitude_deg,
    address,
    res_status,
  } = timeslot;

  const params = [
    id,
    host_id,
    type,
    start_time,
    end_time,
    description,
    city,
    latitude_deg,
    longitude_deg,
    address,
    res_status,
  ];

  await pool.execute(q, params);
  const rows = await pool.execute("SELECT * FROM timeslot WHERE id = ?", [id]);

  return rows[0];
};

const updateTimeslot = async (id, data) => {
  const { ...fields } = data;
  if (!id) throw new Error("timeslot_id is required");

  const allowed = [
    "type",
    "start_time",
    "end_time",
    "description",
    "city",
    "latitude_deg",
    "longitude_deg",
    "address",
    "res_status",
  ];

  const setClauses = [];
  const params = [];

  for (const [key, rawVal] of Object.entries(fields)) {
    if (!allowed.includes(key)) continue;

    let val = rawVal;
    if (key === "start_time" || key === "end_time") {
      val = val.replace("Z", "").replace("T", " ");
    }

    setClauses.push(`${key} = ?`);
    params.push(val);
  }

  const q = `UPDATE timeslot SET ${setClauses.join(", ")} WHERE id = ?`;
  params.push(id);

  await pool.execute(q, params);

  const rows = await pool.execute("SELECT * FROM timeslot WHERE id = ?", [id]);
  return rows[0] ?? null;
};

const deleteTimeslot = async (id, host_id) => {
  const q = "DELETE FROM timeslot_images WHERE timeslot_id = ?";

  await pool.execute(q, [id]);

  const { affectedRows } = await pool.execute(
    "DELETE FROM timeslot WHERE id = ? AND host_id = ?",
    [id, host_id],
  );
  if (affectedRows == 0)
    throw new Error("Timeslot owner and requester do not match.");
};

const deleteAllTimeslotsByHostId = async (host_id) => {
  await pool.execute(
    `
    DELETE ti
    FROM timeslot_images ti
    JOIN timeslot t ON t.id = ti.timeslot_id
    WHERE t.host_id = ?`,
    [host_id],
  );

  const q = "DELETE FROM timeslot WHERE host_id = ?";

  const rows = await pool.query(q, [host_id]);

  console.log("delete all timeslots by host id:", rows);

  return rows[0] > 0;
};

const getTimeslotsWithHost = async () => {
  const timeslots = await pool.query(
    `SELECT t.*, u.first_name, u.last_name
     FROM timeslot t
     JOIN users u ON t.host_id = u.id
     WHERE u.role = 'host' AND t.res_status = 'available' ORDER BY start_time DESC`,
  );

  // Get activities for each timeslot
  for (let timeslot of timeslots) {
    const activities = await pool.query(
      `SELECT a.id, a.name
       FROM timeslot_activities ta
       JOIN activities a ON a.id = ta.activity_id
       WHERE ta.timeslot_id = ?`,
      [timeslot.id],
    );
    const images = await getTimeslotImageURLs(timeslot.id);
    timeslot.images = images;
    timeslot.activities = activities;
  }

  return timeslots;
};

export {
  listAllTimeslot,
  timeslotById,
  addTimeSlot,
  updateTimeslot,
  deleteTimeslot,
  timeslotHistory,
  getOwnedTimeslots,
  getAvailableTimeslots,
  getTimeslotsWithHost,
  deleteAllTimeslotsByHostId,
};
