const { query } = require('../../config/db');

async function create({ rater_id, rated_user_id, listing_id, score, comment }) {
  const { rows } = await query(
    `INSERT INTO ratings (rater_id, rated_user_id, listing_id, score, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [rater_id, rated_user_id, listing_id, score, comment || null]
  );
  return rows[0];
}

async function findByUser(userId) {
  const { rows } = await query(
    `SELECT r.*, u.full_name AS rater_name
     FROM ratings r
     JOIN users u ON u.id = r.rater_id
     WHERE r.rated_user_id = $1
     ORDER BY r.created_at DESC`,
    [userId]
  );
  return rows;
}

async function getAverageForUser(userId) {
  const { rows } = await query(
    'SELECT ROUND(AVG(score)::numeric, 2) AS average, COUNT(*) AS total FROM ratings WHERE rated_user_id = $1',
    [userId]
  );
  return rows[0];
}

module.exports = { create, findByUser, getAverageForUser };
