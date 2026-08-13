const ApiError = require('../../utils/ApiError');
const listingsRepository = require('./listings.repository');

async function createListing(sellerId, data) {
  return listingsRepository.create(sellerId, data);
}

async function getListing(id) {
  const listing = await listingsRepository.findById(id);
  if (!listing) throw ApiError.notFound('Listing not found');
  return listing;
}

async function searchListings(filters) {
  return listingsRepository.search(filters);
}

async function updateListing(id, userId, updates) {
  const listing = await listingsRepository.findById(id);
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.seller_id !== userId) {
    throw ApiError.forbidden('You can only edit your own listings');
  }
  return listingsRepository.update(id, updates);
}

async function deleteListing(id, userId) {
  const listing = await listingsRepository.findById(id);
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.seller_id !== userId) {
    throw ApiError.forbidden('You can only delete your own listings');
  }
  // Soft delete — see listings.repository.js for why.
  await listingsRepository.softRemove(id);
}

async function getListingsByUser(userId) {
  return listingsRepository.findByUser(userId);
}

module.exports = {
  createListing,
  getListing,
  searchListings,
  updateListing,
  deleteListing,
  getListingsByUser,
};
