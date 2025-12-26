const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadController } = require('../controllers/uploadController');

// Cấu hình Multer lưu vào thư mục uploads/
const upload = multer({ dest: 'uploads/' });

// Định nghĩa route POST
router.post('/upload', upload.single('file'), uploadController);

module.exports = router;