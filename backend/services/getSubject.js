const subjectModel = require('../models/subjectModel');

async function searchSubject(subjectName, ctdt) {
    const subjects = await subjectModel.find({
        $or: [
            { subject_id: { $regex: subjectName, $options: 'i' } },
            { subject_name: { $regex: subjectName, $options: 'i' } },
            { subject_name_en: { $regex: subjectName, $options: 'i' } },
        ]
    })
        .limit(10);
    return subjects;
}

module.exports = { searchSubject };