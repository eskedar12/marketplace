const { query } = require('../../config/db');

async function create({ reporter_id, listing_id, reason }) {
  const { rows } = await query(
    `INSERT INTO reports (reporter_id, listing_id, reason, status)
     VALUES ($1, $2, $3, 'pending')
     RETURNING *`,
    [reporter_id, listing_id, reason]
  );
  return rows[0];
}

async function findAll(status) {
  const values = [];
  let whereClause = '';
  if (status) {
    whereClause = 'WHERE status = $1';
    values.push(status);
  }
  const { rows } = await query(
    `SELECT * FROM reports ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return rows;
}

async function updateStatus(id, status) {
  const { rows } = await query(
    'UPDATE reports SET status = $2 WHERE id = $1 RETURNING *',
    [id, status]
  );
  return rows[0] || null;
}

module.exports = { create, findAll, updateStatus };
