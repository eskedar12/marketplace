const { query } = require('../../config/db');

async function add(userId, listingId) {
  const { rows } = await query(
    `INSERT INTO favorites (user_id, listing_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, listing_id) DO NOTHING
     RETURNING *`,
    [userId, listingId]
  );
  return rows[0] || null;
}

async function remove(userId, listingId) {
  await query('DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2', [userId, listingId]);
}

async function listByUser(userId) {
  const { rows } = await query(
    `SELECT l.*
     FROM favorites f
     JOIN listings l ON l.id = f.listing_id
     WHERE f.user_id = $1
     ORDER BY l.created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { add, remove, listByUser };
