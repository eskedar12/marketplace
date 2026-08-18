const { query } = require('../../config/db');

async function add(userId, listingId) {
  const { rows } = await query(
    `INSERT INTO cart_items (user_id, listing_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, listing_id) DO NOTHING
     RETURNING *`,
    [userId, listingId]
  );
  return rows[0] || null;
}

async function remove(userId, listingId) {
  await query('DELETE FROM cart_items WHERE user_id = $1 AND listing_id = $2', [userId, listingId]);
}

// Joins in what the cart UI needs to render each row (title, price,
// primary photo, seller, current status) without extra round trips.
// A listing that went 'sold' or was removed while sitting in someone's
// cart still shows up here so the frontend can flag it before checkout.
async function listByUser(userId) {
  const { rows } = await query(
    `SELECT ci.id AS cart_item_id, ci.created_at AS added_at,
            l.id AS listing_id, l.title, l.price, l.status, l.seller_id,
            u.name AS seller_name,
            (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) AS image_url
     FROM cart_items ci
     JOIN listings l ON l.id = ci.listing_id
     JOIN users u ON u.id = l.seller_id
     WHERE ci.user_id = $1
     ORDER BY ci.created_at DESC`,
    [userId]
  );
  return rows;
}

async function removeByListingIds(userId, listingIds) {
  if (listingIds.length === 0) return;
  await query('DELETE FROM cart_items WHERE user_id = $1 AND listing_id = ANY($2::uuid[])', [
    userId,
    listingIds,
  ]);
}

module.exports = { add, remove, listByUser, removeByListingIds };
