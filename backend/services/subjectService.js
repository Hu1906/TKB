const ClassModel = require('../models/classModel');
const SubjectModel = require('../models/subjectModel');

/**
 * Lấy danh sách lớp theo mã học phần (Subject ID)
 * @param {string} subjectId - Mã học phần (VD: IT3011)
 * @param {string} classType - (Optional) Loại lớp (VD: LT, BT)
 */
async function getClassesBySubject(subjectId, classType) {
    try {
        const query = { subject_id: subjectId };
        if (classType) {
            query.class_type = classType;
        }
        return await ClassModel.find(query);
    } catch (error) {
        throw error;
    }
}

/**
 * Tìm kiếm học phần theo tên hoặc mã
 * @param {string} keyword - Từ khóa tìm kiếm
 */
async function searchSubject(keyword) {
    try {
        return await SubjectModel.find({
            $or: [
                { subject_id: { $regex: keyword, $options: 'i' } },
                { subject_name: { $regex: keyword, $options: 'i' } },
                { subject_name_en: { $regex: keyword, $options: 'i' } },
            ]
        }).limit(10);
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getClassesBySubject,
    searchSubject
};
