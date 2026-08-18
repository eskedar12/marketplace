const express = require('express');
const controller = require('./users.controller');
const { requireAuth } = require('../../middlewares/auth.middleware');
const { uploadAvatar } = require('../../config/multer');

const router = express.Router();

router.get('/me', requireAuth, controller.getMe);
router.patch('/me', requireAuth, controller.updateMe);
// One step: upload to Cloudinary AND save the resulting URL onto the
// user's profile_image, so the frontend doesn't need a separate PATCH
// afterward like it does for listing photos.
router.post('/me/avatar', requireAuth, uploadAvatar.single('avatar'), controller.uploadAvatar);
router.get('/:id', controller.getUserById); // public profile view (e.g. seller info)

module.exports = router;
