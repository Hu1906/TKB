const express = require('express');
const router = express.Router();
const { searchSubjects } = require('../controllers/searchController');
const { getClassesBySubject } = require('../controllers/subjectController');

router.get('/:subjectId/classes', getClassesBySubject);

router.get('/search', searchSubjects);

module.exports = router;