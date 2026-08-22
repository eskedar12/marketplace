const ApiError = require('../../utils/ApiError');
const conversationsRepository = require('./conversations.repository');
const listingsRepository = require('../listings/listings.repository');
const messagesRepository = require('./messages/messages.repository');

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

// Total unread messages across every conversation this user is part of,
// whether they're the buyer or the seller side — powers the badge on
// the Messages nav icon (works the same for both roles).
async function getUnreadMessageCount(userId) {
  return messagesRepository.countUnreadForUser(userId);
}

module.exports = {
  startConversation,
  getConversation,
  getConversationsForUser,
  getUnreadMessageCount,
};
