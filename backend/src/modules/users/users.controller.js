const asyncHandler = require('../../utils/asyncHandler');
const usersService = require('./users.service');

const getMe = asyncHandler(async (req, res) => {
  const user = await usersService.getProfile(req.user.id);
  res.json({ success: true, data: user });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await usersService.getProfile(req.params.id);
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  const user = await usersService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data: user });
});

module.exports = { getMe, getUserById, updateMe };
