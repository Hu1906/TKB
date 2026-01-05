const express = require('express');
const router = express.Router();
const { generateTKB } = require('../controllers/generateController');

// Định nghĩa API POST /api/generate
router.post('/generate', generateTKB);

module.exports = router;