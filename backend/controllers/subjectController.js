const { getClassesBySubject: getClasses, searchSubject } = require('../services/subjectService');

async function getClassesBySubject(req, res) {
    try {
        const subjectId = req.params.subjectId;
        const subjectType = req.query.subjectType;

        const classes = await getClasses(subjectId, subjectType);
        res.status(200).json(classes);
    } catch (error) {
        console.error('Error in getClassesBySubject:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách lớp học' });
    }
}

const searchSubjects = async (req, res) => {
    try {
        const keyword = req.query.q ? req.query.q.trim() : '';
        if (!keyword) {
            return res.status(200).json([]);
        }
        const subjects = await searchSubject(keyword);
        res.status(200).json(subjects);
    } catch (error) {
        console.error('Error in searchSubjects:', error);
        res.status(500).json({ message: 'Lỗi ở backend/controller khi tìm kiếm môn học' });
    }
};

module.exports = { getClassesBySubject, searchSubjects };