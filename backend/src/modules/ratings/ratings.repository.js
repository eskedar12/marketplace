const ApiError = require('../../utils/ApiError');
const { query } = require('../../config/db');

async function create({ rater_id, rated_user_id, listing_id, score, comment }) {
  try {
    const { rows } = await query(
      `INSERT INTO ratings (rater_id, rated_user_id, listing_id, score, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [rater_id, rated_user_id, listing_id, score, comment || null]
    );
    return rows[0];
  } catch (err) {
    // Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
    if (err.code === '23505') {
      // UNIQUE (rater_id, listing_id) — already reviewed this listing.
      throw ApiError.conflict('You have already reviewed this listing');
    }
    if (err.code === '23503') {
      // FK violation — bad rated_user_id or listing_id.
      throw ApiError.badRequest('Invalid user or listing');
    }
    if (err.code === '23514') {
      // CHECK violation — score outside 1-5.
      throw ApiError.badRequest('Rating score must be between 1 and 5');
    }
    throw err;
  }
}

async function findByUser(userId) {
  const { rows } = await query(
    `SELECT r.*, u.name AS rater_name
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
