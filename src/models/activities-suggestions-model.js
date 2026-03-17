import pool from "../utils/database.js";

export const listAllActivitiesSuggestions = async () => {
  const rows = await pool.query("SELECT * FROM activities_suggestions");
  return rows;
};

export const getActivitySuggestionByHostId = async (id) => {
  const rows = await pool.query(
    "SELECT * FROM activities_suggestions WHERE host_id = ?",
    [id],
  );

  return rows;
};

export const getActivitySuggestionById = async (conn = pool, id) => {
  const rows = await conn.query(
    "SELECT * FROM activities_suggestions WHERE id = ?",
    [id],
  );

  return rows[0];
};

export const createActivitySuggestion = async (name, id) => {
  const rows = await pool.query(
    "INSERT INTO activities_suggestions (name, host_id) VALUES (?, ?)",
    [name, id],
  );

  return rows.affectedRows;
};

export const deleteActivitySuggestionById = async (conn = pool, id) => {
  const result = await conn.query(
    "DELETE FROM activities_suggestions WHERE id = ?",
    [id],
  );

  return result.affectedRows;
};

export const handleAcceptActivitySuggestion = async (id) => {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const suggestion = await conn.query(
      "SELECT name FROM activities_suggestions WHERE id = ?",
      [id],
    );

    if (!suggestion || suggestion.length === 0) throw new Error("NOT_FOUND");

    const name = suggestion[0].name;

    const activity = await conn.query(
      "SELECT id FROM activities WHERE name = ?",
      [name],
    );

    if (activity && activity.length > 0) throw new Error("Already exists");

    await conn.query("DELETE FROM activities_suggestions WHERE id = ?", [id]);
    await conn.query("INSERT INTO activities (name) VALUES (?)", [name]);

    await conn.commit();

    return { success: true };
  } catch (error) {
    if (conn) await conn.rollback();
    throw error; // Let the controller handle the specific error type
  } finally {
    if (conn) conn.release();
  }
};
