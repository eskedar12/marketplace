const express = require('express');
const controller = require('./orders.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Chapa's server-to-server callback — must stay unauthenticated, Chapa
// has no way to send our JWT. finalizeOrder() re-verifies with Chapa's
// own API before trusting anything here.
router.post('/webhook', controller.webhook);

router.use(requireAuth); // everything below requires a logged-in user

router.post('/checkout', controller.checkout);
router.get('/verify/:txRef', controller.verify);
router.get('/mine', controller.getMine);
router.get('/selling', controller.getSelling);

module.exports = router;
