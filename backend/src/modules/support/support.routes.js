const express = require('express');
const controller = require('./support.controller');
const validate = require('../../middlewares/validate.middleware');
const { contactSchema } = require('./support.validation');
const { supportLimiter } = require('../../middlewares/rateLimit.middleware');

const router = express.Router();

// Public — the Contact Support page is reachable without being logged in.
router.post('/contact', supportLimiter, validate(contactSchema), controller.contact);

module.exports = router;
