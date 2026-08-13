const asyncHandler = require('../../../utils/asyncHandler');
const messagesService = require('./messages.service');

const send = asyncHandler(async (req, res) => {
  const message = await messagesService.sendMessage(
    req.params.conversationId,
    req.user.id,
    req.body.content
  );
  res.status(201).json({ success: true, data: message });
});

const getAll = asyncHandler(async (req, res) => {
  const messages = await messagesService.getMessages(req.params.conversationId, req.user.id);
  res.json({ success: true, data: messages });
});

module.exports = { send, getAll };
