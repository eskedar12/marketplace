const { query } = require('../../config/db');

async function create({ user_id, type, data }) {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, data)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, type, data || {}]
  );
  return rows[0];
}

// Newest first, capped at 50 — this is a notification feed, not a
// full audit log, so there's no pagination yet.
async function listByUser(userId, limit = 50) {
  const { rows } = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return rows;
}

async function countUnread(userId) {
  const { rows } = await query(
    `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );
  return parseInt(rows[0].count, 10);
}

async function markRead(id, userId) {
  // Scoped to userId too, so one person can't mark another's notification
  // read just by guessing/incrementing an id.
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0] || null;
}

async function markAllRead(userId) {
  await query(`UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE`, [userId]);
}

module.exports = { create, listByUser, countUnread, markRead, markAllRead };
