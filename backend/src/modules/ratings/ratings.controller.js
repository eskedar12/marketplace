const asyncHandler = require('../../utils/asyncHandler');
const ratingsService = require('./ratings.service');

const create = asyncHandler(async (req, res) => {
  const rating = await ratingsService.rateUser(req.user.id, req.body);
  res.status(201).json({ success: true, data: rating });
});

const getForUser = asyncHandler(async (req, res) => {
  const result = await ratingsService.getRatingsForUser(req.params.userId);
  res.json({ success: true, data: result });
});

module.exports = { create, getForUser };
