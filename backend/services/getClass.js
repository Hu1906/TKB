const classModel = require('../models/classModel');

async function getClassesBySubject(subjectId, subjectType) {
    const classes = await classModel.find({ subject_id: subjectId, subject_type: subjectType }).sort({ class_id: 1 });
    return classes;
}
module.exports = { getClassesBySubject };
