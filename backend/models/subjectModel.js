const Mongoose = require('mongoose');

const subjectSchema = new Mongoose.Schema({
    subject_id: { type: String, required: true, unique: true }, // Mã học phần
    subject_name: { type: String, required: true }, // Tên học phần
    subject_name_en: { type: String }, // Tên học phần (tiếng Anh)
    credits: { type: String, required: true }, // Số tín chỉ
    school: { type: String, required: true }, // Viện, trường phụ trách học phần
    subject_type: { type: String, required: true }, // Loại học phần
    required_lab: { type: Boolean, required: true }, // Bắt buộc có thực hành hay không
});
const Subject = Mongoose.models.Subject || Mongoose.model('Subject', subjectSchema);
module.exports = Subject;