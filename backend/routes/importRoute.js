const express = require('express');
const router = express.Router();
const { importData } = require('../controllers/importController');

route.post('/upload', importData);

module.exports = router;