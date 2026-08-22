const asyncHandler = require('../../utils/asyncHandler');
const notificationsService = require('./notifications.service');

const getMine = asyncHandler(async (req, res) => {
  const result = await notificationsService.getForUser(req.user.id);
  res.json({ success: true, data: result });
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationsService.getUnreadCount(req.user.id);
  res.json({ success: true, data: result });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationsService.markRead(req.params.id, req.user.id);
  res.json({ success: true, data: notification });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user.id);
  res.json({ success: true });
});

module.exports = { getMine, getUnreadCount, markRead, markAllRead };
