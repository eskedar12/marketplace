const asyncHandler = require('../../utils/asyncHandler');
const assistantService = require('./assistant.service');

const ask = asyncHandler(async (req, res) => {
  const { reply } = await assistantService.ask(req.body);
  res.json({ success: true, data: { reply } });
});

module.exports = { ask };
