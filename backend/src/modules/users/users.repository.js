// Raw SQL lives here — nowhere else. If you switch DB libraries later,
// this is the only file that needs to change.
const { query } = require('../../config/db');

async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  // Computes rating_avg/rating_count live from the ratings table instead
  // of trusting the stored users.rating_avg/rating_count columns — those
  // columns need a working trigger to stay in sync, which is one more
  // thing that can silently drift out of date. This is always correct.
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.city, u.neighborhood, u.profile_image, u.role,
            u.allow_calls, u.is_verified, u.created_at, u.updated_at,
            COALESCE(r.avg_score, 0) AS rating_avg,
            COALESCE(r.total, 0) AS rating_count
     FROM users u
     LEFT JOIN LATERAL (
       SELECT ROUND(AVG(score)::numeric, 2) AS avg_score, COUNT(*) AS total
       FROM ratings WHERE rated_user_id = u.id
     ) r ON true
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, password_hash, phone, city, neighborhood, role }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, phone, city, neighborhood, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, phone, city, neighborhood, role, is_verified, created_at`,
    [name, email, password_hash, phone, city, neighborhood || null, role]
  );
  return rows[0];
}

async function updateUser(id, fields) {
  // Builds a dynamic SET clause from whatever fields were passed in,
  // so we don't need a separate query for every possible field combination.
  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);

  const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
  const values = keys.map((key) => fields[key]);

  await query(`UPDATE users SET ${setClause} WHERE id = $1`, [id, ...values]);
  // Route back through findById so the response always has the full,
  // consistent profile shape (role, live rating_avg/rating_count) —
  // the same shape /users/me returns.
  return findById(id);
}

module.exports = { findByEmail, findById, createUser, updateUser };