const asyncHandler = require('../../utils/asyncHandler');
const listingsService = require('./listings.service');
const ApiError = require('../../utils/ApiError');

// multer-storage-cloudinary has already uploaded each file to Cloudinary
// by the time this runs — req.files[].path is the resulting secure URL.
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length < 1) {
    throw ApiError.badRequest('Upload at least 1 photo.');
  }
  const urls = req.files.map((f) => f.path);
  res.status(201).json({ success: true, data: { urls } });
});

const create = asyncHandler(async (req, res) => {
  const listing = await listingsService.createListing(req.user.id, req.body);
  res.status(201).json({ success: true, data: listing });
});

const getAll = asyncHandler(async (req, res) => {
  const result = await listingsService.searchListings(req.query);
  // { items, total } — nested under data to match the rest of the API
  // (getOne/update/getMine all do this) and what axiosClient's response
  // interceptor + useListings expect (res.data.items / res.data.total).
  // Previously this spread {items, total} onto the top level instead,
  // which is what caused "Cannot read properties of undefined (reading
  // 'items')" on the frontend.
  res.json({ success: true, data: result });
});

const getOne = asyncHandler(async (req, res) => {
  const listing = await listingsService.getListing(req.params.id);
  res.json({ success: true, data: listing });
});

// Requires login: revealing a phone number is a deliberate, attributable
// action, not something an anonymous visitor should get by hitting the
// endpoint directly.
const getSellerPhone = asyncHandler(async (req, res) => {
  const phone = await listingsService.getSellerPhone(req.params.id);
  res.json({ success: true, data: { phone } });
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

module.exports = { create, getAll, getOne, getSellerPhone, update, remove, getMine, uploadImages };