import pool from "../utils/database.js";

export const getMessagesByConvIdModel = async (id) => {
  return pool.query(
    "SELECT conv_id, sender_id, receiver_id, content, sent_at FROM messages WHERE conv_id = ? ORDER BY sent_at DESC",
    [id],
  );
};

// Hakee käyttäjän keskustelut ja vastaanottajan datan.
// TODO: Aika ruma, löydä nätimpi
export const getConvsByUserIdModel = async (id) => {
  return pool.query(
    `SELECT c.id AS conv_id, u.id AS user_id, u.first_name, u.last_name FROM conversations c 
    JOIN conversation_join cj ON c.id = cj.conv_id 
    JOIN users u ON cj.user_id = u.id WHERE c.id IN 
    (SELECT conv_id FROM conversation_join WHERE user_id = ?) AND NOT u.id = ?`,
    [id, id],
  );
};

export const postMessageModel = async (message) => {
  const { id, conv_id, sender_id, receiver_id, content } = message;
  const q = `INSERT INTO messages(id, conv_id, sender_id, receiver_id, content)
            VALUES(?, ?, ?, ?, ?)`;
  const params = [id, conv_id, sender_id, receiver_id, content];
  await pool.execute(q, params);
  const rows = await pool.execute(
    `
  SELECT id, conv_id, sender_id, receiver_id, content, sent_at
  FROM messages
  WHERE id = ?
  `,
    [id],
  );
  return rows[0];
};
