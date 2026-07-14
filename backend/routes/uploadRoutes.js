const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { protect, admin } = require('../middleware/authMiddleware');

// Configure Cloudinary if credentials are present
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer disk storage setup (serves as staging for Cloudinary, and final location for local fallback)
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// File validation helper
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|mp4|webm|mkv|mov|avi/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Only images and videos are allowed!');
  }
}

const upload = multer({
  storage,
  fileFilter(req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an image or video
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.single('media'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;

  // Check if it's a video based on mimetype/extension
  const isVideo = req.file.mimetype.startsWith('video/');

  if (isCloudinaryConfigured) {
    try {
      // Upload to Cloudinary using standard stream or helper
      const uploadOptions = {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'kgn_accessories',
      };

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      // Successfully uploaded to Cloudinary, remove local staged file
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error('Failed to delete temporary upload file:', unlinkErr);
      }

      // Return the Cloudinary URL
      return res.json({
        url: result.secure_url,
        message: 'Uploaded to Cloudinary successfully',
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Fallback: If Cloudinary fails, use the local file URL instead of crashing
      const host = req.get('host');
      const protocol = req.protocol;
      const fileUrl = `${protocol}://${host}/${filePath.replace(/\\/g, '/')}`;
      return res.json({
        url: fileUrl,
        message: 'Cloudinary upload failed. Fallback to local server storage.',
      });
    }
  } else {
    // Cloudinary not configured, return local server URL
    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/${filePath.replace(/\\/g, '/')}`;
    return res.json({
      url: fileUrl,
      message: 'Cloudinary not configured. Uploaded to local server storage.',
    });
  }
});

module.exports = router;
