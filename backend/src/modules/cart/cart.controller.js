const asyncHandler = require('../../utils/asyncHandler');
const cartService = require('./cart.service');

const getMine = asyncHandler(async (req, res) => {
  const items = await cartService.getCart(req.user.id);
  res.json({ success: true, data: items });
});

const add = asyncHandler(async (req, res) => {
  const item = await cartService.addToCart(req.user.id, req.params.listingId);
  res.status(201).json({ success: true, data: item });
});

const remove = asyncHandler(async (req, res) => {
  await cartService.removeFromCart(req.user.id, req.params.listingId);
  res.status(204).send();
});

module.exports = { getMine, add, remove };
