import pool from "../utils/database.js";

const listAllTimeslot = async () => {
  const rows = await pool.query("SELECT * FROM timeslot");
  return rows;
};

const timeslotById = async (id) => {
  return await pool.query("SELECT * FROM timeslot WHERE id = ?", [id]);
};

const timeslotHistory = async (id) => {
  return await pool.query(
    "SELECT * FROM timeslot WHERE host_id = ? AND end_time < NOW()",
    [id],
  );
};

const addTimeSlot = async (timeslot) => {
  const q = `INSERT INTO timeslot(id, host_id, type, start_time, end_time, description,
                          city, latitude_deg, longitude_deg, activity_type)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let {
    id,
    host_id,
    type,
    start_time,
    end_time,
    description,
    city,
    latitude_deg,
    longitude_deg,
    activity_type,
  } = timeslot;

  start_time = start_time.replace("Z", "").replace("T", " ");
  end_time = end_time.replace("Z", "").replace("T", " ");

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
    activity_type,
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
    "activity_type",
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

export {
  listAllTimeslot,
  timeslotById,
  addTimeSlot,
  updateTimeslot,
  deleteTimeslot,
  timeslotHistory,
};
