const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const usersRepository = require('../modules/users/users.repository');

// Verifies the Bearer token and attaches { id, email } to req.user.
// Any protected route just does: router.get('/x', requireAuth, handler)
const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

// Use on routes that behave differently for logged-in vs anonymous users
// (e.g. listings detail showing a "favorited" flag) without blocking access.
const optionalAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = { id: payload.sub, email: payload.email };
  } catch (err) {
    // silently ignore — treat as anonymous
  }
  next();
};

// Use AFTER requireAuth on routes that only one role should reach
// (e.g. creating a listing is seller-only). Looks the role up fresh from
// the DB rather than trusting the JWT, so a role change takes effect
// immediately instead of waiting for the user to log in again.
const requireRole = (...allowedRoles) =>
  asyncHandler(async (req, res, next) => {
    const user = await usersRepository.findById(req.user.id);
    if (!user) {
      throw ApiError.unauthorized('Invalid or expired token');
    }
    if (!allowedRoles.includes(user.role)) {
      throw ApiError.forbidden(`This action requires a ${allowedRoles.join(' or ')} account`);
    }
    next();
  });

module.exports = { requireAuth, optionalAuth, requireRole };
