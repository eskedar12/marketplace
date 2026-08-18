const express = require('express');
const controller = require('./listings.controller');
const validate = require('../../middlewares/validate.middleware');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { uploadListingImages } = require('../../config/multer');
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
router.get('/:id/seller-phone', requireAuth, controller.getSellerPhone);
router.get('/me/mine', requireAuth, controller.getMine);
// Upload listing photos to Cloudinary first, get back their URLs, then
// send those URLs along with the rest of the form to POST /listings.
// Kept as its own step (rather than one multipart POST) so the create
// form can show upload progress/previews before the listing exists.
router.post('/upload-images', requireAuth, uploadListingImages.array('images', 5), controller.uploadImages);
router.post('/', requireAuth, validate(createListingSchema), controller.create);
router.patch('/:id', requireAuth, validate(updateListingSchema), controller.update);
router.delete('/:id', requireAuth, controller.remove);

module.exports = router;
