require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // Fail fast — a missing secret at runtime is worse than a crash at boot.
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    // 100 was fine before the app added background polling (the
    // notification bell + unread-messages badge each check in every
    // 30s), but that alone is ~60 requests/15min per person just
    // sitting idle — on top of normal browsing, a shared limit of 100
    // for the *entire* API gets hit almost immediately. 1000 leaves
    // real headroom for that plus normal use; override via
    // RATE_LIMIT_MAX in production if you want it tighter.
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 1000,
  },
  // Not in `required` above — checked lazily in chapa.js at the moment a
  // checkout is actually attempted, so the rest of the app still boots
  // fine before payments are configured.
  chapaSecretKey: process.env.CHAPA_SECRET_KEY,
  // Where Chapa sends the buyer back after paying, and where Chapa calls
  // server-to-server to confirm payment. Falls back to localhost so local
  // dev works out of the box; override both in production.
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
};
