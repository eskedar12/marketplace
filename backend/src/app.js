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

const app = express();

// ---- Security & core middleware ----
app.use(helmet());
app.use(cors()); // tighten to your frontend's origin before deploying
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

// ---- 404 for unmatched routes ----
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---- Centralized error handler (must be last) ----
app.use(errorMiddleware);

module.exports = app;
