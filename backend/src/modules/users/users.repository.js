// Raw SQL lives here — nowhere else. If you switch DB libraries later,
// this is the only file that needs to change.
const { query } = require('../../config/db');

async function findByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query(
    `SELECT id, name, email, phone, city, neighborhood, profile_image,
            is_verified, rating_avg, rating_count, created_at, updated_at
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, password_hash, phone, city, neighborhood }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, phone, city, neighborhood)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, phone, city, neighborhood, is_verified, created_at`,
    [name, email, password_hash, phone, city, neighborhood || null]
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

  const { rows } = await query(
    `UPDATE users SET ${setClause} WHERE id = $1
     RETURNING id, name, email, phone, city, neighborhood, profile_image, updated_at`,
    [id, ...values]
  );
  return rows[0] || null;
}

module.exports = { findByEmail, findById, createUser, updateUser };
