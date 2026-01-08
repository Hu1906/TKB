const classModel = require('../models/classModel');

async function getClassesBySubject(subjectId, subjectType) {
    const query = { subject_id: subjectId };
    
    // Nếu có subjectType thì filter thêm
    if (subjectType) {
        query.subject_type = subjectType;
    }
    
    const classes = await classModel.find(query).sort({ class_id: 1 });
    return classes;
}

module.exports = { getClassesBySubject };