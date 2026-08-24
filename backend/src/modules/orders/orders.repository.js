const { query, pool } = require('../../config/db');

// One INSERT per listing being purchased, all sharing the same tx_ref so
// they can be looked up and settled together once Chapa confirms payment.
async function createPendingOrders(client, buyerId, txRef, listings) {
  const rows = [];
  for (const listing of listings) {
    const { rows: inserted } = await client.query(
      `INSERT INTO orders (buyer_id, seller_id, listing_id, price, status, tx_ref)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [buyerId, listing.seller_id, listing.id, listing.price, txRef]
    );
    rows.push(inserted[0]);
  }
  return rows;
}

async function deleteByTxRef(txRef) {
  await query('DELETE FROM orders WHERE tx_ref = $1', [txRef]);
}

async function findByTxRef(txRef) {
  const { rows } = await query(
    `SELECT o.*, l.title AS listing_title
     FROM orders o
     JOIN listings l ON l.id = o.listing_id
     WHERE o.tx_ref = $1`,
    [txRef]
  );
  return rows;
}

// Runs the payment-confirmed side effects as one transaction: mark every
// order under this tx_ref paid, mark those listings sold (so they can't
// be bought twice), and clear them out of anyone else's cart.
async function markPaid(txRef) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: orders } = await client.query(
      `UPDATE orders SET status = 'paid' WHERE tx_ref = $1 AND status = 'pending' RETURNING *`,
      [txRef]
    );

    if (orders.length > 0) {
      const listingIds = orders.map((o) => o.listing_id);
      await client.query(
        `UPDATE listings SET status = 'sold', reserved_until = NULL WHERE id = ANY($1::uuid[])`,
        [listingIds]
      );
      await client.query(`DELETE FROM cart_items WHERE listing_id = ANY($1::uuid[])`, [listingIds]);
    }

    await client.query('COMMIT');
    return orders;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function markFailed(txRef) {
  const { rows } = await query(
    `UPDATE orders SET status = 'failed' WHERE tx_ref = $1 AND status = 'pending' RETURNING *`,
    [txRef]
  );
  return rows;
}

async function listByBuyer(buyerId) {
  const { rows } = await query(
    `SELECT o.*, l.title AS listing_title, u.name AS seller_name,
            (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) AS image_url
     FROM orders o
     JOIN listings l ON l.id = o.listing_id
     JOIN users u ON u.id = o.seller_id
     WHERE o.buyer_id = $1
     ORDER BY o.created_at DESC`,
    [buyerId]
  );
  return rows;
}

async function listBySeller(sellerId) {
  const { rows } = await query(
    `SELECT o.*, l.title AS listing_title, u.name AS buyer_name,
            (SELECT image_url FROM listing_images WHERE listing_id = l.id ORDER BY sort_order ASC LIMIT 1) AS image_url
     FROM orders o
     JOIN listings l ON l.id = o.listing_id
     JOIN users u ON u.id = o.buyer_id
     WHERE o.seller_id = $1
     ORDER BY o.created_at DESC`,
    [sellerId]
  );
  return rows;
}

module.exports = {
  createPendingOrders,
  deleteByTxRef,
  findByTxRef,
  markPaid,
  markFailed,
  listByBuyer,
  listBySeller,
};
