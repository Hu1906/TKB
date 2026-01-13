const xlsx = require('xlsx');
const mongoose = require('mongoose');

// Hàm parse chuỗi  tuần học: "2-9,11-20" -> "2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20"
function parseWeeks(weeksString) {
    if (!weeksString || typeof weeksString !== 'string') return [];
    const weeks = [];
    const parts = weeksString.split(',');

    parts.forEach(part => {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                weeks.push(i);
            }
        } else {
            const w = Number(part.trim());
            if (!isNaN(w)) {
                weeks.push(w);
            }
        }
    });
    return weeks;
}

// Hàm parse chuỗi thời gian
function parseTime(timeString) {
    if (!timeString || typeof timeString !== 'string') return null;
    const [start, end] = timeString.split('-').map(String);
    return { start, end };
}

//Hàm xử lý file Excel và lưu vào database
async function parseExcel(filePath) {

    //Đọc file excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    //Chuyển dữ liệu từ sheet thành JSON
    const rawdata = xlsx.utils.sheet_to_json(sheet, { range: 2 }); // Bỏ qua 2 dòng đầu tiên (header)

    const classesMap = new Map(); // Map để nhóm các lớp theo class_id
    const subjectsMap = new Map(); // Map để lưu các học phần đã thêm

    rawdata.forEach(row => {
        if (row['Trạng_thái'] === "Hủy lớp") return;

        const subjectId = row['Mã_HP'];
        const classId = row['Mã_lớp'];
        // Tạo thông tin môn học
        if (!subjectsMap.has(subjectId)) {
            subjectsMap.set(subjectId, {
                subject_id: subjectId,
                subject_name: row['Tên_HP'],
                subject_name_en: row['Tên_HP_Tiếng_Anh'] || '',
                credits: row['Khối_lượng'],
                school: row['Trường_Viện_Khoa'],
                subject_type: row['Mã_QL'],
                required_lab: row['Cần_TN'] === 'TN' ? true : false
            });
        }
        const time_period = parseTime(row['Thời_gian']);
        // Xử lý thông tin buổi học (Sessions)
        const session = {
            day: row['Thứ'] ? Number(row['Thứ']) : null,
            start_time: time_period ? time_period.start : null,
            end_time: time_period ? time_period.end : null,
            room: row['Phòng'] || '',
            weeks: parseWeeks(row['Tuần']),
        };
        if (classesMap.has(classId)) {
            const existingClass = classesMap.get(classId);
            if (session.day) existingClass.sessions.push(session);
        } else {
            // Tạo mới thông tin lớp học
            classesMap.set(classId, {
                class_id: classId,
                subject_id: subjectId,
                class_included_id: row['Mã_lớp_kèm'],
                class_type: row['Loại_lớp'],
                note: row['Ghi_chú'],
                subject_type: row['Mã_QL'],
                sessions: session.day ? [session] : []
            });
        }
    });

    return {
        subjects: Array.from(subjectsMap.values()),
        classes: Array.from(classesMap.values())
    };
}

module.exports = { parseExcel };