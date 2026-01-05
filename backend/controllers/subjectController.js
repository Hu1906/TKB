const { getClassesBySubject } = require('../services/getClassesBySubject');

async function getClassesBySubject(req, res) {
    try {
        const subjectId = req.params.subjectId;
        const subjectType = req.body.subjectType; 
        const classes = await getClassesBySubject(subjectId, subjectType);
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi ở backend/controller khi lấy lớp học theo môn học' });
    }
}

module.exports = { getClassesBySubject };