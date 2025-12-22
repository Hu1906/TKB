const Mongoose = require('mongoose');

const classSchema = new Mongoose.Schema({
    class_id: { type: String, required: true }, // Mã lớp học phần
    subject_id: { type: String, required: true }, // Mã học phần
    subject_included_id: { type: String, required: true }, // Mã học phần kèm theo
    note: { type: String }, // Ghi chú
    class_type: { type: String, required: true }, // Loại lớp học phần

    sessions: [{
    day: Number,              // Thứ (2, 3, 4, 5, 6, 7)
    start_time: Number,     // Thời gian bắt đầu (BĐ)
    end_time: Number,       // Thời gian kết thúc (KT)
    room: String,             // Phòng học
    weeks: [Number]           // Mảng các tuần học (đã parse từ chuỗi "2-9,11-19")
  }]
});