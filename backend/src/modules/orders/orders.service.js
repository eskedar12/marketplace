const crypto = require('crypto');
const { pool } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const chapa = require('../../utils/chapa');
const ordersRepository = require('./orders.repository');
const listingsRepository = require('../listings/listings.repository');
const usersRepository = require('../users/users.repository');
const notificationsService = require('../notifications/notifications.service');

// Called from either "Buy Now" (a single listing id) or the Cart page
// (however many listing ids are checked out together). Either way it's
// the same flow: validate, snapshot prices, create pending order rows,
// start one Chapa transaction covering all of them.
async function checkout(buyerId, listingIds) {
  const uniqueIds = [...new Set(listingIds)];
  if (uniqueIds.length === 0) {
    throw ApiError.badRequest('No items to check out');
  }

  const listings = await listingsRepository.findManyByIds(uniqueIds);
  if (listings.length !== uniqueIds.length) {
    throw ApiError.badRequest('One or more listings could not be found');
  }
  for (const listing of listings) {
    if (listing.seller_id === buyerId) {
      throw ApiError.badRequest('You cannot buy your own listing');
    }
    if (listing.status !== 'active') {
      throw ApiError.badRequest(`"${listing.title}" is no longer available`);
    }
  }

  const buyer = await usersRepository.findById(buyerId);
  const txRef = `regebeya-${crypto.randomUUID()}`;
  const [firstName, ...rest] = (buyer.name || 'Buyer').split(' ');

  const client = await pool.connect();
  let reserved;
  try {
    await client.query('BEGIN');
    // Authoritative check: the lookup above can be stale by the time we
    // get here, so re-verify + lock atomically. If someone else's
    // checkout reserved one of these listings a moment ago, it won't
    // come back in `reserved` and we bail out below. Using the price on
    // these rows (not the pre-check ones above) also protects against
    // a seller editing the price in between.
    reserved = await listingsRepository.reserveForCheckout(client, uniqueIds);
    if (reserved.length !== uniqueIds.length) {
      await client.query('ROLLBACK');
      throw ApiError.badRequest(
        'One or more items were just reserved or sold by someone else — please refresh and try again'
      );
    }
    await ordersRepository.createPendingOrders(client, buyerId, txRef, reserved);
    await client.query('COMMIT');
  } catch (err) {
    // Safe to call even if we already rolled back above (or never
    // started the reservation branch) — ROLLBACK with no transaction
    // in progress is a harmless no-op, not an error.
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const total = reserved.reduce((sum, l) => sum + Number(l.price), 0);

  try {
    const { checkoutUrl } = await chapa.initializeTransaction({
      amount: total,
      email: buyer.email,
      first_name: firstName,
      last_name: rest.join(' ') || firstName,
      tx_ref: txRef,
      title: 'ReGebeya',
      description:
        reserved.length === 1
          ? reserved[0].title
          : `${reserved.length} items from ReGebeya`,
    });
    return { checkoutUrl, txRef, total };
  } catch (err) {
    // Payment never actually started — don't leave orphaned pending
    // orders sitting in the buyer's history, and release the
    // reservation so the listing is buyable again immediately instead
    // of waiting out the 20-minute expiry.
    await ordersRepository.deleteByTxRef(txRef);
    await listingsRepository.releaseReservation(uniqueIds);
    throw err;
  }
}

// Shared by both the buyer-facing verify endpoint and Chapa's webhook —
// always re-checks with Chapa's own API rather than trusting anything
// the caller claims about payment status.
async function finalizeOrder(txRef) {
  const existing = await ordersRepository.findByTxRef(txRef);
  if (existing.length === 0) throw ApiError.notFound('Order not found');

  // Already settled — don't hit Chapa again, just return what we have.
  if (existing.every((o) => o.status !== 'pending')) {
    return existing;
  }

  const { paid } = await chapa.verifyTransaction(txRef);
  if (!paid) {
    const failed = await ordersRepository.markFailed(txRef);
    await listingsRepository.releaseReservation(failed.map((o) => o.listing_id));
    return failed;
  }

  const paidOrders = await ordersRepository.markPaid(txRef);
  await notifySellersOfSale(paidOrders);
  return paidOrders;
}

// One "your listing sold" notification per seller per item — a single
// checkout can cover listings from several different sellers, so this
// can fire more than one notification for one tx_ref.
async function notifySellersOfSale(paidOrders) {
  if (!paidOrders.length) return;
  // Same buyer for every order under one tx_ref — fetch once.
  const buyer = await usersRepository.findById(paidOrders[0].buyer_id);
  for (const order of paidOrders) {
    const listing = await listingsRepository.findById(order.listing_id);
    await notificationsService.notify(order.seller_id, 'listing_sold', {
      listingId: order.listing_id,
      listingTitle: listing?.title,
      buyerName: buyer?.name,
      price: order.price,
    });
  }
}

async function verifyForBuyer(txRef, buyerId) {
  const existing = await ordersRepository.findByTxRef(txRef);
  if (existing.length === 0) throw ApiError.notFound('Order not found');
  if (existing[0].buyer_id !== buyerId) {
    throw ApiError.forbidden('This order does not belong to you');
  }
  return finalizeOrder(txRef);
}

async function getOrdersForBuyer(buyerId) {
  return ordersRepository.listByBuyer(buyerId);
}

async function getOrdersForSeller(sellerId) {
  return ordersRepository.listBySeller(sellerId);
}

module.exports = { checkout, finalizeOrder, verifyForBuyer, getOrdersForBuyer, getOrdersForSeller };
