const express = require('express');
const { optionalAuth } = require('../../middlewares/auth.middleware');
const { assistantLimiter } = require('../../middlewares/rateLimit.middleware');
const validate = require('../../middlewares/validate.middleware');
const { askSchema } = require('./assistant.validation');
const controller = require('./assistant.controller');

const router = express.Router();

// optionalAuth (not requireAuth) — the widget should work for anonymous
// browsers too, since most of the marketplace is browsable without an
// account. Nothing in the assistant currently uses req.user, but it's
// there if you want to personalize the greeting later.
router.post('/ask', optionalAuth, assistantLimiter, validate(askSchema), controller.ask);

module.exports = router;
