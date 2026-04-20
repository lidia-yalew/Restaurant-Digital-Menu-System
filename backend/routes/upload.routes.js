// backend/routes/upload.routes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure upload directory exists
const uploadDir = 'public/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Destination - file:', file.originalname);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  console.log('File filter - mimetype:', file.mimetype);
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload single image
router.post('/image', (req, res) => {
  console.log('Upload request received');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  
  // Use multer single upload
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    try {
      console.log('Request file:', req.file);
      console.log('Request body:', req.body);
      
      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ 
          success: false, 
          error: 'No image file uploaded' 
        });
      }
      
      const imageUrl = `/uploads/${req.file.filename}`;
      console.log('Image uploaded successfully:', imageUrl);
      
      res.json({ 
        success: true, 
        imageUrl: imageUrl,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
});

// Upload multiple images (optional)
router.post('/images', upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No image files uploaded' 
      });
    }
    
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    res.json({ 
      success: true, 
      imageUrls: imageUrls,
      message: 'Images uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Delete image (optional)
router.delete('/image/:filename', (req, res) => {
  try {
    const filepath = path.join(__dirname, '../public/uploads', req.params.filename);
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      res.json({ 
        success: true, 
        message: 'Image deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Image not found' 
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;