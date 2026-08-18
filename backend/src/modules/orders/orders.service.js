const crypto = require('crypto');
const { pool } = require('../../config/db');
const ApiError = require('../../utils/ApiError');
const chapa = require('../../utils/chapa');
const ordersRepository = require('./orders.repository');
const listingsRepository = require('../listings/listings.repository');
const usersRepository = require('../users/users.repository');

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
  const total = listings.reduce((sum, l) => sum + Number(l.price), 0);
  const txRef = `regebeya-${crypto.randomUUID()}`;
  const [firstName, ...rest] = (buyer.name || 'Buyer').split(' ');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await ordersRepository.createPendingOrders(client, buyerId, txRef, listings);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  try {
    const { checkoutUrl } = await chapa.initializeTransaction({
      amount: total,
      email: buyer.email,
      first_name: firstName,
      last_name: rest.join(' ') || firstName,
      tx_ref: txRef,
      title: 'ReGebeya',
      description:
        listings.length === 1
          ? listings[0].title
          : `${listings.length} items from ReGebeya`,
    });
    return { checkoutUrl, txRef, total };
  } catch (err) {
    // Payment never actually started — don't leave orphaned pending
    // orders sitting in the buyer's history.
    await ordersRepository.deleteByTxRef(txRef);
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
  return paid ? ordersRepository.markPaid(txRef) : ordersRepository.markFailed(txRef);
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
