const asyncHandler = require('../../utils/asyncHandler');
const ordersService = require('./orders.service');
const ApiError = require('../../utils/ApiError');

const checkout = asyncHandler(async (req, res) => {
  const { listing_ids } = req.body;
  if (!Array.isArray(listing_ids) || listing_ids.length === 0) {
    throw ApiError.badRequest('listing_ids must be a non-empty array');
  }
  const result = await ordersService.checkout(req.user.id, listing_ids);
  res.status(201).json({ success: true, data: result });
});

// Buyer's return trip from the Chapa checkout page — confirms status and
// applies the results (mark paid/failed, mark listings sold, etc).
const verify = asyncHandler(async (req, res) => {
  const orders = await ordersService.verifyForBuyer(req.params.txRef, req.user.id);
  res.json({ success: true, data: orders });
});

// Chapa calls this server-to-server after a payment completes. Not
// authenticated with a user JWT — Chapa can't hold one — so this only
// ever trusts the tx_ref and re-verifies with Chapa's own API before
// changing anything.
const webhook = asyncHandler(async (req, res) => {
  const txRef = req.body?.tx_ref || req.query.tx_ref;
  if (!txRef) return res.status(400).json({ success: false, message: 'Missing tx_ref' });
  await ordersService.finalizeOrder(txRef);
  res.json({ success: true });
});

const getMine = asyncHandler(async (req, res) => {
  const orders = await ordersService.getOrdersForBuyer(req.user.id);
  res.json({ success: true, data: orders });
});

const getSelling = asyncHandler(async (req, res) => {
  const orders = await ordersService.getOrdersForSeller(req.user.id);
  res.json({ success: true, data: orders });
});

module.exports = { checkout, verify, webhook, getMine, getSelling };
