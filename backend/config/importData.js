const DB = require('../config/db');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const { parseExcel } = require('../services/parseExcel');

//Hàm lưu vào database
async function importDataFromExcel(filePath) {

    // 1. Kết nối đến database
    const connectedDB = await DB.connectDB();
    if (!connectedDB) return;
    // 2. Parse file Excel
    const { subjects, classes } = await parseExcel(filePath);
    // 3. Lưu vào MongoDB
    try {
        // Xóa dữ liệu cũ trước khi import mới (tùy chọn)
        await Subject.deleteMany({});
        await Class.deleteMany({});
        // Insert
        await Subject.insertMany(subjects);
        await Class.insertMany(classes);
        console.log(`Đã import thành công ${subjects.length} môn học và ${classes.length} lớp học!`);
    } catch (error) {
        console.error("Lỗi khi lưu vào DB:", error);
    } 
    // 4. Ngắt kết nối database
    await DB.disconnectDB();
}

module.exports = { importDataFromExcel };