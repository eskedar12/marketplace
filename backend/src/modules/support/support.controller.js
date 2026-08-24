const asyncHandler = require('../../utils/asyncHandler');
const supportService = require('./support.service');

const contact = asyncHandler(async (req, res) => {
  await supportService.sendContactMessage(req.body);
  res.status(200).json({ success: true, data: { sent: true } });
});

module.exports = { contact };
