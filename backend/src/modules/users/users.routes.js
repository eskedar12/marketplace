const express = require('express');
const controller = require('./users.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', requireAuth, controller.getMe);
router.patch('/me', requireAuth, controller.updateMe);
router.get('/:id', controller.getUserById); // public profile view (e.g. seller info)

module.exports = router;
