const conversationsService = require('../conversations.service');
const messagesRepository = require('./messages.repository');

async function sendMessage(conversationId, senderId, content) {
  // Confirms the sender is actually part of this conversation before writing.
  await conversationsService.getConversation(conversationId, senderId);
  return messagesRepository.create({ conversation_id: conversationId, sender_id: senderId, content });
}

async function getMessages(conversationId, userId) {
  await conversationsService.getConversation(conversationId, userId);
  const messages = await messagesRepository.listByConversation(conversationId);
  await messagesRepository.markRead(conversationId, userId);
  return messages;
}

module.exports = { sendMessage, getMessages };
