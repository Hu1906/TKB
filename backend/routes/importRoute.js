const express = require('express');
const router = express.Router();
const { importData } = require('../controllers/importController');

router.post('/upload', importData);

module.exports = router;