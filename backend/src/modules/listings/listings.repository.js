const { query, pool } = require('../../config/db');

async function create(sellerId, data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
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
    const listing = rows[0];

    // First photo is the primary/thumbnail image; sort_order preserves
    // the order the seller uploaded them in.
    await insertImages(client, listing.id, data.images);

    await client.query('COMMIT');
    return listing;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function insertImages(client, listingId, imageUrls) {
  const values = [];
  const placeholders = imageUrls
    .map((url, idx) => {
      const base = idx * 4;
      values.push(listingId, url, idx === 0, idx);
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    })
    .join(', ');

  await client.query(
    `INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) VALUES ${placeholders}`,
    values
  );
}

async function findById(id) {
  // Deliberately does NOT select the seller's raw phone number here —
  // this response is fetched (and cached in browser history/devtools)
  // just from viewing the listing, before the buyer has chosen to call.
  // seller_allows_calls tells the frontend whether to show the Call
  // Seller button at all; the actual number is only ever revealed via
  // getSellerPhone(), which the frontend calls at the moment of a click.
  const listingResult = await query(
    `SELECT l.*, c.name AS category_name, c.slug AS category_slug,
            u.name AS seller_name, u.allow_calls AS seller_allows_calls
     FROM listings l
     JOIN categories c ON c.id = l.category_id
     JOIN users u ON u.id = l.seller_id
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
    // plainto_tsquery requires whole words after stemming (e.g. typing
    // "coff" would never match "coffee" until the word is finished).
    // For a search-as-you-type experience, build a prefix-matching
    // tsquery instead: each word gets a `:*` prefix wildcard, and
    // multiple words are ANDed together. Special tsquery characters
    // are stripped from each term first so user input can't break the
    // query syntax.
    const prefixQuery = q
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((term) => term.replace(/[&|!():*']/g, '') + ':*')
      .join(' & ');

    if (prefixQuery) {
      conditions.push(`l.search_vector @@ to_tsquery('english', $${i++})`);
      values.push(prefixQuery);
    }
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
  const { images, ...columns } = fields;
  const keys = Object.keys(columns);

  if (keys.length === 0 && !images) return findById(id);

  if (keys.length > 0) {
    const setClause = keys.map((key, idx) => `${key} = $${idx + 2}`).join(', ');
    const values = keys.map((key) => columns[key]);
    await query(`UPDATE listings SET ${setClause} WHERE id = $1`, [id, ...values]);
  }

  if (images) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM listing_images WHERE listing_id = $1', [id]);
      await insertImages(client, id, images);
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  return findById(id);
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

// Fetches just what's needed to place a call: the seller's phone number
// and whether they currently allow calls at all. Kept separate from
// findById so the number is only ever fetched at the moment a buyer
// clicks Call Seller — never bundled into the general listing payload.
async function getSellerPhone(listingId) {
  const { rows } = await query(
    `SELECT u.phone, u.allow_calls
     FROM listings l
     JOIN users u ON u.id = l.seller_id
     WHERE l.id = $1`,
    [listingId]
  );
  return rows[0] || null;
}

// Fetches multiple listings by id in one query — used by checkout to
// validate + price every item in a cart/buy-now request at once.
async function findManyByIds(ids) {
  if (ids.length === 0) return [];
  const { rows } = await query('SELECT * FROM listings WHERE id = ANY($1::uuid[])', [ids]);
  return rows;
}

module.exports = { create, findById, findManyByIds, search, update, softRemove, findByUser, getSellerPhone };