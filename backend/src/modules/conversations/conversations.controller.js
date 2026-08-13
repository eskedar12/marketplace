const asyncHandler = require('../../utils/asyncHandler');
const conversationsService = require('./conversations.service');

const start = asyncHandler(async (req, res) => {
  const conversation = await conversationsService.startConversation(req.user.id, req.body.listing_id);
  res.status(201).json({ success: true, data: conversation });
});

const getMine = asyncHandler(async (req, res) => {
  const conversations = await conversationsService.getConversationsForUser(req.user.id);
  res.json({ success: true, data: conversations });
});

const getOne = asyncHandler(async (req, res) => {
  const conversation = await conversationsService.getConversation(req.params.id, req.user.id);
  res.json({ success: true, data: conversation });
});

module.exports = { start, getMine, getOne };
