const ApiError = require('../../utils/ApiError');
const listingsRepository = require('./listings.repository');
const cartRepository = require('../cart/cart.repository');
const notificationsService = require('../notifications/notifications.service');
const categoriesService = require('../categories/categories.service');

// Joi only checks that category_id is *a* valid UUID (see
// listings.validation.js) — it can't know which categories are
// parents vs. leaves. Enforcing "leaf only" here means a listing can
// never end up tagged with a parent category (e.g. "Vehicles")
// instead of a subcategory (e.g. "Cars"), which is what silently broke
// the subcategory filter pills before this check existed.
async function assertLeafCategory(categoryId) {
  const isLeaf = await categoriesService.isLeafCategory(categoryId);
  if (!isLeaf) {
    throw ApiError.badRequest('Please choose a specific subcategory, not a top-level category.');
  }
}

async function createListing(sellerId, data) {
  await assertLeafCategory(data.category_id);
  return listingsRepository.create(sellerId, data);
}

async function getListing(id) {
  const listing = await listingsRepository.findById(id);
  if (!listing) throw ApiError.notFound('Listing not found');
  return listing;
}

async function getSellerPhone(listingId) {
  const row = await listingsRepository.getSellerPhone(listingId);
  if (!row) throw ApiError.notFound('Listing not found');
  if (!row.allow_calls) throw ApiError.forbidden('This seller is not accepting calls');
  return row.phone;
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
  if (updates.category_id !== undefined) {
    await assertLeafCategory(updates.category_id);
  }

  const isPriceDrop = updates.price !== undefined && Number(updates.price) < Number(listing.price);

  const updated = await listingsRepository.update(id, updates);

  if (isPriceDrop) {
    // Anyone with this listing sitting in their cart gets pinged —
    // fire-and-forget per user, same as every other notification call.
    const cartUserIds = await cartRepository.findUserIdsByListing(id);
    for (const cartUserId of cartUserIds) {
      await notificationsService.notify(cartUserId, 'price_drop', {
        listingId: id,
        listingTitle: listing.title,
        newPrice: updates.price,
      });
    }
  }

  return updated;
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
  getSellerPhone,
  searchListings,
  updateListing,
  deleteListing,
  getListingsByUser,
};