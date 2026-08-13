const asyncHandler = require('../../utils/asyncHandler');
const favoritesService = require('./favorites.service');

const add = asyncHandler(async (req, res) => {
  const favorite = await favoritesService.addFavorite(req.user.id, req.params.listingId);
  res.status(201).json({ success: true, data: favorite });
});

const remove = asyncHandler(async (req, res) => {
  await favoritesService.removeFavorite(req.user.id, req.params.listingId);
  res.status(204).send();
});

const getMine = asyncHandler(async (req, res) => {
  const favorites = await favoritesService.getFavorites(req.user.id);
  res.json({ success: true, data: favorites });
});

module.exports = { add, remove, getMine };
