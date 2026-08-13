const asyncHandler = require('../../utils/asyncHandler');
const listingsService = require('./listings.service');

const create = asyncHandler(async (req, res) => {
  const listing = await listingsService.createListing(req.user.id, req.body);
  res.status(201).json({ success: true, data: listing });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await listingsService.searchListings(req.query);
  res.json({ success: true, ...result });
});

const getOne = asyncHandler(async (req, res) => {
  const listing = await listingsService.getListing(req.params.id);
  res.json({ success: true, data: listing });
});

const update = asyncHandler(async (req, res) => {
  const listing = await listingsService.updateListing(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: listing });
});

const remove = asyncHandler(async (req, res) => {
  await listingsService.deleteListing(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Listing removed' });
});

const getMine = asyncHandler(async (req, res) => {
  const listings = await listingsService.getListingsByUser(req.user.id);
  res.json({ success: true, data: listings });
});

module.exports = { create, getAll, getOne, update, remove, getMine };
