const express = require('express');
const controller = require('./ratings.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/user/:userId', controller.getForUser); // public — build trust signal
router.post('/', requireAuth, controller.create);

module.exports = router;
