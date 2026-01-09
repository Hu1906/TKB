const express = require('express');
const router = express.Router();

const { importData } = require('../controllers/importController');
const { searchSubjects, getClassesBySubject } = require('../controllers/subjectController');
const { generateTKB } = require('../controllers/generateController');

// Import
router.post('/import/upload', importData);

// Subjects
router.get('/subjects/search', searchSubjects);
router.get('/subjects/:subjectId/classes', getClassesBySubject);

// Generate
router.post('/generate/generate', generateTKB);

module.exports = router;
