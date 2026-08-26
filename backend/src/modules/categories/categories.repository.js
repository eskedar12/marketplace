const { query } = require('../../config/db');

async function findAll() {
  const { rows } = await query(
    'SELECT id, parent_id, name, slug FROM categories ORDER BY parent_id NULLS FIRST, name ASC'
  );
  return rows;
}

async function findBySlug(slug) {
  const { rows } = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await query('SELECT * FROM categories WHERE id = $1', [id]);
  return rows[0] || null;
}

module.exports = { findAll, findBySlug, findById };