const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const errorMiddleware = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimit.middleware');

const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const listingsRoutes = require('./modules/listings/listings.routes');
const favoritesRoutes = require('./modules/favorites/favorites.routes');
const conversationsRoutes = require('./modules/conversations/conversations.routes');
const ratingsRoutes = require('./modules/ratings/ratings.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const cartRoutes = require('./modules/cart/cart.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const notificationsRoutes = require('./modules/notifications/notifications.routes');
const assistantRoutes = require('./modules/assistant/assistant.routes');
const supportRoutes = require('./modules/support/support.routes');
const faydaRoutes = require('./modules/fayda/fayda.routes');

const app = express();

// ---- Security & core middleware ----
app.use(helmet({ contentSecurityPolicy: false }));

// Allow the configured FRONTEND_URL plus common local dev ports, so a
// missing/mismatched FRONTEND_URL in .env can't silently break CORS.
//
// API_BASE_URL is also included here (not just FRONTEND_URL) because the
// Fayda mock login page is server-rendered HTML served BY this backend
// itself (see src/modules/fayda/fayda.controller.js) — when that page's
// <form> POSTs back to /api/v1/fayda/mock/login, the browser sends an
// Origin header equal to the backend's own URL, not the frontend's. Without
// this, the backend rejects its own form submission as a CORS violation.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.API_BASE_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Non-browser tools (curl, Postman) send no Origin header — allow those too.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));

app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(apiLimiter);

// ---- Health check (useful for Render/Railway uptime checks) ----
app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

// ---- Routes ----
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, usersRoutes);
app.use(`${API_PREFIX}/categories`, categoriesRoutes);
app.use(`${API_PREFIX}/listings`, listingsRoutes);
app.use(`${API_PREFIX}/favorites`, favoritesRoutes);
app.use(`${API_PREFIX}/conversations`, conversationsRoutes);
app.use(`${API_PREFIX}/ratings`, ratingsRoutes);
app.use(`${API_PREFIX}/reports`, reportsRoutes);
app.use(`${API_PREFIX}/cart`, cartRoutes);
app.use(`${API_PREFIX}/orders`, ordersRoutes);
app.use(`${API_PREFIX}/notifications`, notificationsRoutes);
app.use(`${API_PREFIX}/assistant`, assistantRoutes);
app.use(`${API_PREFIX}/support`, supportRoutes);
app.use(`${API_PREFIX}/fayda`, faydaRoutes);

// ---- 404 for unmatched routes ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---- Centralized error handler (must be last) ----
app.use(errorMiddleware);

module.exports = app;