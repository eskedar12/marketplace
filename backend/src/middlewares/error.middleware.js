const logger = require('../utils/logger');

// Must be registered LAST in app.js — Express recognizes error middleware
// by its 4-argument signature.
function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  if (!isOperational) {
    // Unexpected bug — log full stack for debugging, don't leak it to the client.
    logger.error(err);
  }

  res.status(statusCode).json({
    success: false,
    // In development, show the real error so you're not debugging blind —
    // production still hides internals behind a generic message.
    message: isOperational || process.env.NODE_ENV !== 'production' ? err.message : 'Something went wrong',
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = errorMiddleware;
