const express = require('express');
const controller = require('./favorites.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(requireAuth); // every favorites route requires a logged-in user

router.get('/', controller.getMine);
router.post('/:listingId', controller.add);
router.delete('/:listingId', controller.remove);

module.exports = router;
