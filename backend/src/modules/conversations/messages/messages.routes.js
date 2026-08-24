const express = require('express');
const controller = require('./messages.controller');
const validate = require('../../../middlewares/validate.middleware');
const { sendMessageSchema } = require('./messages.validation');

// mergeParams lets this router read :conversationId from the parent route
const router = express.Router({ mergeParams: true });

router.get('/', controller.getAll);
router.post('/', validate(sendMessageSchema), controller.send);

module.exports = router;
