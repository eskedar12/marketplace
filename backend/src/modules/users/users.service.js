const ApiError = require('../../utils/ApiError');
const usersRepository = require('./users.repository');

async function getProfile(userId) {
  const user = await usersRepository.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

async function updateProfile(userId, updates) {
  // Whitelist updatable fields — never let a client update password_hash,
  // rating_avg, rating_count, or is_verified through this endpoint.
  const allowed = ['name', 'phone', 'city', 'neighborhood', 'profile_image', 'allow_calls'];
  const fields = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) fields[key] = updates[key];
  }
  return usersRepository.updateUser(userId, fields);
}

module.exports = { getProfile, updateProfile };
