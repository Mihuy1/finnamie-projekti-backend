import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

export const getMessagesByConvIdModel = async (id) => {
  return pool.query(
    "SELECT * FROM messages WHERE conv_id = ? ORDER BY sent_at ASC",
    [id],
  );
};

// Hakee käyttäjän keskustelut ja vastaanottajan datan.
export const getConvsByUserIdModel = async (id) => {
  return pool.query(
    `SELECT DISTINCT cj2.conv_id AS conv_id, u.id AS user_id, u.first_name, u.last_name
    FROM conversation_join cj1
    JOIN conversation_join cj2 ON cj1.conv_id = cj2.conv_id AND cj2.user_id != cj1.user_id
    JOIN users u ON u.id = cj2.user_id
    WHERE cj1.user_id = ?`,
    [id],
  );
};

export const postMessageModel = async (message) => {
  const { id, conv_id, sender_id, receiver_id, content } = message;
  const q = `INSERT INTO messages(id, conv_id, sender_id, receiver_id, content, is_read)
            VALUES(?, ?, ?, ?, ?, 0)`;
  const params = [id, conv_id, sender_id, receiver_id, content];

  await pool.execute(q, params);

  const [rows] = await pool.execute(
    `SELECT id, conv_id, sender_id, receiver_id, content, sent_at, is_read
     FROM messages
     WHERE id = ?`,
    [id]
  );

  return rows[0];
};

export const startConversationModel = async (sender_id, receiver_id) => {
  // Check if conversation already exists
  const existingConv = await getConversation(sender_id, receiver_id);
  if (existingConv) {
    return existingConv.conv_id;
  }
  const conv_id = uuidv4();
  try {
    await pool.execute("INSERT INTO conversations(id) VALUES(?)", conv_id);
    await pool.execute(
      "INSERT INTO conversation_join(user_id, conv_id) VALUES(?, ?), (?,?)",
      [sender_id, conv_id, receiver_id, conv_id],
    );
    return conv_id;
  } catch (err) {
    throw new Error(err);
  }
};

export const getConversation = async (sender_id, receiver_id) => {
  const q = `SELECT conv_id FROM conversation_join WHERE user_id IN 
            ( ?, ?) GROUP BY conv_id HAVING COUNT(DISTINCT user_id) = 2`;
  const rows = await pool.execute(q, [sender_id, receiver_id]);
  return rows[0];
};

export const getUnreadCountModel = async (userId) => {
  const q = `SELECT COUNT(*) AS count FROM messages WHERE receiver_id = ? AND is_read = 0`;
  const rows = await pool.execute(q, [userId]);
  return rows[0];
};

export const markMessagesAsReadModel = async (convId, userId) => {
  const q = `UPDATE messages SET is_read = 1 WHERE conv_id = ? AND receiver_id = ? AND is_read = 0`;
  await pool.execute(q, [convId, userId]);
};