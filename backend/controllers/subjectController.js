const { getClassesBySubject: getClasses } = require('../services/getClass');

async function getClassesBySubject(req, res) {
    try {
        const subjectId = req.params.subjectId;
        const subjectType = req.query.subjectType; // Lấy từ query string thay vì body
        
        const classes = await getClasses(subjectId, subjectType);
        res.status(200).json(classes);
    } catch (error) {
        console.error('Error in getClassesBySubject:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách lớp học' });
    }
}

module.exports = { getClassesBySubject };