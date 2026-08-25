const { query } = require('../../config/db');

// Only active listings belong in the sitemap — sold/removed listings
// are dead pages, and indexing them just wastes crawl budget and can
// show shoppers a "sold" page from search results.
async function findActiveListings() {
  const { rows } = await query(
    `SELECT id, updated_at FROM listings WHERE status = 'active' ORDER BY updated_at DESC`
  );
  return rows;
}

async function findAllCategories() {
  const { rows } = await query('SELECT slug FROM categories ORDER BY slug ASC');
  return rows;
}

module.exports = { findActiveListings, findAllCategories };
