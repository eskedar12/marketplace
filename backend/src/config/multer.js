const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const listingImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "marketplace/listings", // Optional: organize images in a specific folder in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png"], // Restrict file types
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "marketplace/avatars",
    allowed_formats: ["jpg", "jpeg", "png"],
    // Keep profile photos small and square-cropped on Cloudinary's side
    // so every avatar renders consistently regardless of what the user uploaded.
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  },
});

const uploadListingImages = multer({ storage: listingImageStorage });
const uploadAvatar = multer({ storage: avatarStorage });

module.exports = { uploadListingImages, uploadAvatar };