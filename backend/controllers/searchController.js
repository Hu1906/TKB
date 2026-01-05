const { searchSubject } = require('../services/getSubject');

const searchSubjects = async (req, res) => {
    try {
        const keyword = req.query.q ? req.query.q.trim() : '';
        if (!keyword) {
            return res.status(200).json([]);
        }
        const subjects = await searchSubject(keyword);
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi ở backend/controller khi tìm kiếm môn học' });
    }
};

module.exports = { searchSubjects };