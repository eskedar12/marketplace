const ApiError = require('../../utils/ApiError');
const conversationsRepository = require('./conversations.repository');
const listingsRepository = require('../listings/listings.repository');

async function startConversation(buyerId, listingId) {
  const listing = await listingsRepository.findById(listingId);
  if (!listing) throw ApiError.notFound('Listing not found');
  if (listing.seller_id === buyerId) {
    throw ApiError.badRequest('You cannot message yourself about your own listing');
  }

  return conversationsRepository.findOrCreate({
    listing_id: listingId,
    buyer_id: buyerId,
    seller_id: listing.seller_id,
  });
}

async function getConversation(id, userId) {
  const conversation = await conversationsRepository.findById(id);
  if (!conversation) throw ApiError.notFound('Conversation not found');
  if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
    throw ApiError.forbidden('Not part of this conversation');
  }
  return conversation;
}

async function getConversationsForUser(userId) {
  return conversationsRepository.listForUser(userId);
}

module.exports = { startConversation, getConversation, getConversationsForUser };
