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

export const createActivitySuggestion = async (name, id) => {
  const rows = await pool.query(
    "INSERT INTO activities_suggestions (name, host_id) VALUES (?, ?)",
    [name, id],
  );

  return rows.affectedRows;
};

export const deleteActivitySuggestionById = async (id) => {
  const result = await pool.query(
    "DELETE FROM activities_suggestions WHERE id = ?",
    [id],
  );

  return result.affectedRows;
};
