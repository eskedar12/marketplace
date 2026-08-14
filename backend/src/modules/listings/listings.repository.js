const { query } = require('../../config/db');

async function create(sellerId, data) {
  const { rows } = await query(
    `INSERT INTO listings (seller_id, category_id, title, description, price, condition, city, neighborhood, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
     RETURNING *`,
    [
      sellerId,
      data.category_id,
      data.title,
      data.description,
      data.price,
      data.condition,
      data.city,
      data.neighborhood || null,
    ]
  );
  return rows[0];
}

async function findById(id) {
  const listingResult = await query(
    `SELECT l.*, c.name AS category_name, c.slug AS category_slug
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     WHERE l.id = $1`,
    [id]
  );
  const listing = listingResult.rows[0];
  if (!listing) return null;

  const imagesResult = await query(
    'SELECT image_url, is_primary, sort_order FROM listing_images WHERE listing_id = $1 ORDER BY sort_order ASC',
    [id]
  );
  listing.images = imagesResult.rows;
  return listing;
}

// Search + filter + pagination in one query.
// Uses the generated `search_vector` column (see schema.sql) which is
// already backed by a GIN index, so free-text search stays fast as the
// table grows — no on-the-fly to_tsvector() call needed here.
async function search({ q, category_id, condition, min_price, max_price, city, neighborhood, page, limit }) {
  const conditions = ["l.status = 'active'"];
  const values = [];
  let i = 1;

  if (q) {
    conditions.push(`l.search_vector @@ plainto_tsquery('english', $${i++})`);
    values.push(q);
  }
  if (condition) {
    conditions.push(`l.condition = $${i++}`);
    values.push(condition);
  }
  if (category_id) {
    // A category browse page passes the parent id plus all of its
    // subcategory ids (comma-separated) so listings tagged directly
    // under a subcategory still show up on the parent's page.
    const ids = Array.isArray(category_id)
      ? category_id
      : String(category_id).split(',').filter(Boolean);

    if (ids.length === 1) {
      conditions.push(`l.category_id = $${i++}`);
      values.push(ids[0]);
    } else if (ids.length > 1) {
      conditions.push(`l.category_id = ANY($${i++}::uuid[])`);
      values.push(ids);
    }
  }
  if (min_price !== undefined) {
    conditions.push(`l.price >= $${i++}`);
    values.push(min_price);
  }
  if (max_price !== undefined) {
    conditions.push(`l.price <= $${i++}`);
    values.push(max_price);
  }
  if (city) {
    conditions.push(`l.city ILIKE $${i++}`);
    values.push(`%${city}%`);
  }
  if (neighborhood) {
    conditions.push(`l.neighborhood ILIKE $${i++}`);
    values.push(`%${neighborhood}%`);
  }

  const whereClause = conditions.join(' AND ');
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT l.id, l.title, l.price, l.condition, l.city, l.neighborhood, l.status,
           l.view_count, l.created_at, l.category_id, c.name AS category_name,
      (SELECT image_url FROM listing_images WHERE listing_id = l.id AND is_primary = true LIMIT 1) AS thumbnail_url
    FROM listings l
    JOIN categories c ON c.id = l.category_id
    WHERE ${whereClause}
    ORDER BY l.created_at DESC
    LIMIT $${i++} OFFSET $${i++}
  `;
  values.push(limit, offset);

  const countQuery = `SELECT COUNT(*) FROM listings l WHERE ${whereClause}`;
  const countValues = values.slice(0, values.length - 2);

  const [dataResult, countResult] = await Promise.all([
    query(dataQuery, values),
    query(countQuery, countValues),
  ]);

  return {
    items: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    page,
    limit,
  };
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return findById(id);

  const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
  const values = keys.map((key) => fields[key]);

  const { rows } = await query(
    `UPDATE listings SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values]
  );
  return rows[0] || null;
}

// Soft delete: the schema's listing_status enum includes 'removed' precisely
// so listing history stays intact for existing conversations/ratings/reports
// that reference this listing_id (hard DELETE would cascade and wipe those).
async function softRemove(id) {
  const { rows } = await query(
    "UPDATE listings SET status = 'removed' WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0] || null;
}

async function findByUser(sellerId) {
  const { rows } = await query(
    `SELECT l.*, c.name AS category_name
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     WHERE l.seller_id = $1
     ORDER BY l.created_at DESC`,
    [sellerId]
  );
  return rows;
}

module.exports = { create, findById, search, update, softRemove, findByUser };