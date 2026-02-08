import pool from "../utils/database.js";

export const getMessagesByConvIdModel = async (id) => {
  return pool.query(
    "SELECT conv_id, sender_id, receiver_id, content, sent_at FROM messages WHERE conv_id = ?",
    [id],
  );
};

export const getConvsByUserIdModel = async (id) => {
  return pool.query(
    `SELECT c.id FROM conversations c 
                       INNER JOIN conversation_join cj ON c.id = cj.conv_id 
                       INNER JOIN users u ON cj.user_id = u.id WHERE u.id = ?`,
    [id],
  );
};
