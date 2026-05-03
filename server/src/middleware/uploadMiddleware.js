// uploadMiddleware.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'brand-os/thumbnails', allowed_formats: ['jpg','jpeg','png','gif','webp'], transformation: [{ width: 800, height: 450, crop: 'fill', quality: 'auto' }] },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'brand-os/avatars', allowed_formats: ['jpg','jpeg','png','webp'], transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }] },
});

exports.uploadThumbnail = multer({ storage: thumbnailStorage, limits: { fileSize: 5 * 1024 * 1024 } }).single('thumbnail');
exports.uploadAvatar = multer({ storage: avatarStorage, limits: { fileSize: 2 * 1024 * 1024 } }).single('avatar');
