const ApiError = require('../../utils/ApiError');
const cartRepository = require('./cart.repository');
const listingsRepository = require('../listings/listings.repository');

async function addToCart(userId, listingId) {
  const listing = await listingsRepository.findById(listingId);
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.seller_id === userId) {
    throw ApiError.badRequest('You cannot add your own listing to your cart');
  }
  if (listing.status !== 'active') {
    throw ApiError.badRequest('This listing is no longer available');
  }
  return cartRepository.add(userId, listingId);
}

async function removeFromCart(userId, listingId) {
  return cartRepository.remove(userId, listingId);
}

async function getCart(userId) {
  return cartRepository.listByUser(userId);
}

module.exports = { addToCart, removeFromCart, getCart };
