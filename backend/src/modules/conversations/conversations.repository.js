const { query } = require('../../config/db');

async function findOrCreate({ listing_id, buyer_id, seller_id }) {
  const existing = await query(
    'SELECT * FROM conversations WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3',
    [listing_id, buyer_id, seller_id]
  );
  if (existing.rows[0]) return existing.rows[0];

  const { rows } = await query(
    `INSERT INTO conversations (listing_id, buyer_id, seller_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [listing_id, buyer_id, seller_id]
  );
  return rows[0];
}

async function findById(id) {
  // Joins in the listing title and both participants' names so the
  // thread view can show "who" + "about what" without extra round trips.
  const { rows } = await query(
    `SELECT c.*, l.title AS listing_title,
       b.name AS buyer_name, s.name AS seller_name
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users b ON b.id = c.buyer_id
     JOIN users s ON s.id = c.seller_id
     WHERE c.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function listForUser(userId) {
  // Pulls the listing title, the other participant's name, and the last
  // message so the inbox view needs just this one query instead of N
  // follow-up calls.
  const { rows } = await query(
    `SELECT c.*, l.title AS listing_title,
       CASE WHEN c.buyer_id = $1 THEN s.name ELSE b.name END AS other_user_name,
       CASE WHEN c.buyer_id = $1 THEN c.seller_id ELSE c.buyer_id END AS other_user_id,
       (SELECT content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) AS last_message,
       (SELECT sent_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.sent_at DESC LIMIT 1) AS last_message_at
     FROM conversations c
     JOIN listings l ON l.id = c.listing_id
     JOIN users b ON b.id = c.buyer_id
     JOIN users s ON s.id = c.seller_id
     WHERE c.buyer_id = $1 OR c.seller_id = $1
     ORDER BY last_message_at DESC NULLS LAST`,
    [userId]
  );
  return rows;
}

module.exports = { findOrCreate, findById, listForUser };
