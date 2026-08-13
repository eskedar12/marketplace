const express = require('express');
const controller = require('./conversations.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');
const messagesRoutes = require('./messages/messages.routes');

const router = express.Router();

router.use(requireAuth);

router.get('/', controller.getMine);
router.post('/', controller.start);
router.get('/:id', controller.getOne);

// nested: /api/v1/conversations/:conversationId/messages
router.use('/:conversationId/messages', messagesRoutes);

module.exports = router;
