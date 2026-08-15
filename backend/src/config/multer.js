const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "marketplace/listings", // Optional: organize images in a specific folder in your Cloudinary account
    allowed_formats: ["jpg", "jpeg", "png"], // Restrict file types
  },
});

const upload = multer({ storage: storage });
module.exports = upload;