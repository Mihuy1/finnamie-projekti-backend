import pool from "../utils/database.js";

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

const getOwnedTimeslots = async (id) => {
  return await pool.query("SELECT * FROM timeslot WHERE host_id = ?", [id]);
};

const getAvailableTimeslots = async () => {
  return await pool.query(
    "SELECT * FROM timeslot WHERE res_status = 'available'",
  );
};

const addTimeSlot = async (timeslot) => {
  const q = `INSERT INTO timeslot(id, host_id, type, start_time, end_time, description,
                          city, latitude_deg, longitude_deg)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
  } = timeslot;

  /*
  start_time = start_time.replace("Z", "").replace("T", " ");
  end_time = end_time.replace("Z", "").replace("T", " ");
  */

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
  ];

  await pool.execute(q, params);
  // Return inserted row to display for the host.
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
  const { affectedRows } = await pool.execute(
    "DELETE FROM timeslot WHERE id = ? AND host_id = ?",
    [id, host_id],
  );
  if (affectedRows == 0)
    throw new Error("Timeslot owner and requester do not match.");
};

const getTimeslotsWithHost = async () => {
  const timeslots = await pool.query(
    `SELECT t.*, u.first_name, u.last_name 
     FROM timeslot t 
     JOIN users u ON t.host_id = u.id 
     WHERE u.role = 'host' AND t.res_status = 'available'`,
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
};
