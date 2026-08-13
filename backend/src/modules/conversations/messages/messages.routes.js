const express = require('express');
const controller = require('./messages.controller');

// mergeParams lets this router read :conversationId from the parent route
const router = express.Router({ mergeParams: true });

router.get('/', controller.getAll);
router.post('/', controller.send);

module.exports = router;
