import pool from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

export const getMessagesByConvIdModel = async (id) => {
  const [rows] = await pool.query(
    "SELECT * FROM messages WHERE conv_id = ? ORDER BY sent_at ASC",
    [id],
  );

  return rows;
};

// Hakee käyttäjän keskustelut ja vastaanottajan datan.
// TODO: Aika ruma
export const getConvsByUserIdModel = async (id) => {
  const [rows] = await pool.query(
    `SELECT c.id AS conv_id, u.id AS user_id, u.first_name, u.last_name FROM conversations c 
    JOIN conversation_join cj ON c.id = cj.conv_id 
    JOIN users u ON cj.user_id = u.id WHERE c.id IN 
    (SELECT conv_id FROM conversation_join WHERE user_id = ?) AND NOT u.id = ?`,
    [id, id],
  );

  return rows;
};

export const postMessageModel = async (message) => {
  const { id, conv_id, sender_id, receiver_id, content } = message;
  const q = `INSERT INTO messages(id, conv_id, sender_id, receiver_id, content)
            VALUES(?, ?, ?, ?, ?)`;
  const params = [id, conv_id, sender_id, receiver_id, content];
  await pool.execute(q, params);
  const [rows] = await pool.execute(
    `
  SELECT id, conv_id, sender_id, receiver_id, content, sent_at
  FROM messages
  WHERE id = ?
  `,
    [id],
  );
  return rows[0];
};

export const startConversationModel = async (sender_id, receiver_id) => {
  // TODO:
  // estä uuden keskustelun aloittaminen, jos keskutelu lähettäjän ja vastaanottajan välillä on jo olemassa
  const conv_id = uuidv4();
  try {
    await pool.execute("INSERT INTO conversations(id) VALUES(?)", [conv_id]);
    await pool.execute(
      "INSERT INTO conversation_join(user_id, conv_id) VALUES(?, ?), (?,?)",
      [sender_id, conv_id, receiver_id, conv_id],
    );
    return conv_id;
  } catch (err) {
    throw new Error(err);
  }
};
