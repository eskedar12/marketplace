const rateLimit = require('express-rate-limit');
const env = require('../config/env');

// This limiter keys by IP by default, meaning every request from your
// one dev machine — every browser tab, every background poll — shares
// a single bucket. That's the right protection for a public deployment,
// but it has no real purpose while developing locally, so it's skipped
// entirely outside production rather than just raised to a big number.
const isProd = env.nodeEnv === 'production';

// General limiter applied to the whole API.
const apiLimiter = isProd
  ? rateLimit({
      windowMs: env.rateLimit.windowMs,
      max: env.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' },
    })
  : (req, res, next) => next();

// Stricter limiter for auth endpoints — mitigates credential stuffing / brute force.
const authLimiter = isProd
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many auth attempts, please try again later.' },
    })
  : (req, res, next) => next();

// Stricter limiter for the AI page-assistant — each request costs a real
// API call, unlike everything else in the app, so this gets its own tighter
// budget rather than sharing the general apiLimiter's headroom.
const assistantLimiter = isProd
  ? rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many assistant requests, please slow down.' },
    })
  : (req, res, next) => next();

module.exports = { apiLimiter, authLimiter, assistantLimiter };
