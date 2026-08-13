const { query } = require('../../../config/db');

async function create({ conversation_id, sender_id, content }) {
  const { rows } = await query(
    `INSERT INTO messages (conversation_id, sender_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [conversation_id, sender_id, content]
  );
  return rows[0];
}

async function listByConversation(conversationId) {
  const { rows } = await query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
    [conversationId]
  );
  return rows;
}

async function markRead(conversationId, readerId) {
  // Marks every unread message NOT sent by the reader as read —
  // i.e. "I've now seen the other person's messages".
  await query(
    `UPDATE messages SET read_at = now()
     WHERE conversation_id = $1 AND sender_id != $2 AND read_at IS NULL`,
    [conversationId, readerId]
  );
}

module.exports = { create, listByConversation, markRead };
