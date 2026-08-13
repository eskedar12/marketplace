const express = require('express');
const controller = require('./categories.controller');

const router = express.Router();

// Public — needed to populate filter dropdowns before a user logs in
router.get('/', controller.getAll);

module.exports = router;
