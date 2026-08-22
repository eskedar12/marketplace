const conversationsService = require('../conversations.service');
const messagesRepository = require('./messages.repository');
const notificationsService = require('../../notifications/notifications.service');

async function sendMessage(conversationId, senderId, content) {
  // Confirms the sender is actually part of this conversation before writing.
  // Also doubles as the lookup for who the *other* participant is, so the
  // notification below doesn't need a second query.
  const conversation = await conversationsService.getConversation(conversationId, senderId);
  const message = await messagesRepository.create({ conversation_id: conversationId, sender_id: senderId, content });

  const senderIsBuyer = conversation.buyer_id === senderId;
  const recipientId = senderIsBuyer ? conversation.seller_id : conversation.buyer_id;
  const senderName = senderIsBuyer ? conversation.buyer_name : conversation.seller_name;

  await notificationsService.notify(recipientId, 'new_message', {
    senderName,
    listingId: conversation.listing_id,
    listingTitle: conversation.listing_title,
    conversationId,
  });

  return message;
}

async function getMessages(conversationId, userId) {
  await conversationsService.getConversation(conversationId, userId);
  const messages = await messagesRepository.listByConversation(conversationId);
  await messagesRepository.markRead(conversationId, userId);
  return messages;
}

module.exports = { sendMessage, getMessages };
