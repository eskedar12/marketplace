const express = require('express');
const controller = require('./reports.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

// NOTE: getAll/updateStatus should be admin-only in production —
// add an `isAdmin` check in auth.middleware.js once you have user roles.
router.post('/', requireAuth, controller.create);
router.get('/', requireAuth, controller.getAll);
router.patch('/:id', requireAuth, controller.updateStatus);

module.exports = router;
