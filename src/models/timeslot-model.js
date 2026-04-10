import pool from "../utils/database.js";
import { getTimeslotImageURLs } from "./upload-model.js";
import { v4 as uuidv4 } from "uuid";

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

const timeslotByExperienceId = async (experienceId, conn = pool) => {
  const timeslots = await conn.query(
    "SELECT * FROM timeslot WHERE experience_id = ?",
    [experienceId],
  );

  if (timeslots.length === 0) return [];

  return timeslots;
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

const generateTimeslots = async (conn = pool, parsedRule, experienceId) => {
  if (!experienceId) throw new Error("experience_id is required");

  const ruleId = Number(parsedRule?.id);
  if (!ruleId) throw new Error("rule_id is required for timeslot generation");

  const [experience] = await conn.query(
    "SELECT host_id FROM experiences WHERE id = ?",
    [experienceId],
  );

  if (!experience?.host_id) {
    throw new Error("Experience not found for timeslot generation");
  }

  const bitmask = Number(parsedRule.weekdays_bitmask);
  const startDate = new Date(parsedRule.start_date);
  const endDate = new Date(parsedRule.end_date);
  const candidates = [];

  const toSqlDateTime = (value) => {
    if (typeof value === "string") {
      return value.replace("T", " ").slice(0, 19);
    }

    return new Date(value).toISOString().slice(0, 19).replace("T", " ");
  };

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    const dayBit = 1 << currentDate.getDay();

    if ((bitmask & dayBit) === 0) continue;

    const dateStr = currentDate.toISOString().slice(0, 10);
    candidates.push({
      start_time: `${dateStr} ${parsedRule.start_time}`,
      end_time: `${dateStr} ${parsedRule.end_time}`,
      max_participants: Number(parsedRule.max_participants),
    });
  }

  if (candidates.length === 0) {
    return { affectedRows: 0 };
  }

  const dateStart = parsedRule.start_date;
  const dateEnd = parsedRule.end_date;

  const existingRows = await conn.query(
    `SELECT start_time, end_time
     FROM timeslot
     WHERE rule_id = ?
       AND DATE(start_time) BETWEEN ? AND ?`,
    [ruleId, dateStart, dateEnd],
  );

  const existingKeys = new Set(
    existingRows.map(
      (row) =>
        `${toSqlDateTime(row.start_time)}|${toSqlDateTime(row.end_time)}`,
    ),
  );

  const rows = [];
  const params = [];

  for (const slot of candidates) {
    const key = `${toSqlDateTime(slot.start_time)}|${toSqlDateTime(slot.end_time)}`;
    if (existingKeys.has(key)) continue;

    rows.push("(?, ?, ?, ?, ?, ?, ?)");
    params.push(
      uuidv4(),
      experience.host_id,
      Number(experienceId),
      ruleId,
      slot.start_time,
      slot.end_time,
      slot.max_participants,
    );
  }

  if (rows.length === 0) {
    return { affectedRows: 0 };
  }

  const q = `INSERT INTO timeslot (id, host_id, experience_id, rule_id, start_time, end_time, max_participants)
             VALUES ${rows.join(", ")}`;

  return await conn.execute(q, params);
};

const getTimeslotsByRuleId = async (ruleId, conn = pool) => {
  const rows = await conn.query(
    "SELECT * FROM timeslot WHERE rule_id = ? ORDER BY start_time ASC",
    [ruleId],
  );
  return rows;
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

const getTimeslotBookingCount = async (timeslotId, conn = pool) => {
  const q =
    "SELECT current_bookings, max_participants FROM timeslot WHERE id = ?";

  const rows = await conn.query(q, [timeslotId]);

  console.log("rows in getTimeslotBookingCount:", rows);

  return rows[0];
};

const increaseBookingCount = async (timeslot_id, conn = pool) => {
  const q = `UPDATE timeslot SET current_bookings = current_bookings + 1 WHERE id = ? AND current_bookings < max_participants`;
  const result = await conn.execute(q, [timeslot_id]);

  return result;
};

const getTimeslotByIdWithExperience = async (timeslot_id, conn = pool) => {
  const q = `SELECT e.title, e.description, e.city, JSON_ARRAYAGG(
      JSON_OBJECT('url', ti.url)
    ) AS images FROM timeslot t JOIN experiences e ON t.experience_id = e.id LEFT JOIN timeslot_images ti ON e.id = ti.experience_id WHERE t.id = ?`;
  const result = await pool.query(q, [timeslot_id]);
  return result[0];
};

export {
  listAllTimeslot,
  timeslotById,
  addTimeSlot,
  updateTimeslot,
  generateTimeslots,
  getTimeslotsByRuleId,
  deleteTimeslot,
  timeslotHistory,
  getOwnedTimeslots,
  getAvailableTimeslots,
  getTimeslotsWithHost,
  deleteAllTimeslotsByHostId,
  getTimeslotBookingCount,
  increaseBookingCount,
  getTimeslotByIdWithExperience,
};
