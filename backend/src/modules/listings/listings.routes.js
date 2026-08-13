const express = require('express');
const controller = require('./listings.controller');
const validate = require('../../middlewares/validate.middleware');
const { requireAuth } = require('../../middlewares/auth.middleware');
const {
  createListingSchema,
  updateListingSchema,
  searchQuerySchema,
} = require('./listings.validation');

const router = express.Router();

// Public — anyone can browse/search listings
router.get('/', validate(searchQuerySchema, 'query'), controller.getAll);
router.get('/:id', controller.getOne);

// Protected — must be logged in
router.get('/me/mine', requireAuth, controller.getMine);
router.post('/', requireAuth, validate(createListingSchema), controller.create);
router.patch('/:id', requireAuth, validate(updateListingSchema), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
