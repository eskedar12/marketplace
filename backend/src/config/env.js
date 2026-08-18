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
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
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
