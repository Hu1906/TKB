const DB = require('../config/db');
const parseExcelService = require('../services/parseExcelService');
const classModel = require('../models/classModel');
const subjectModel = require('../models/subjectModel');


const importData = async (req, res) => {
    try {
        await DB.connectDB();
        const result = await parseExcelService.parseExcel('../backend/config/TKB20252-FULL.xlsx');
        
        console.log('Đang xóa dữ liệu cũ...');
        await classModel.deleteMany({});
        await subjectModel.deleteMany({});

        // 4. Lưu dữ liệu mới vào database
        console.log('Đang lưu dữ liệu mới...');
        
        if (result.subjects.length > 0) {
            await subjectModel.insertMany(result.subjects);
            console.log(`Đã import ${result.subjects.length} môn học.`);
        }
        
        if (result.classes.length > 0) {
            await classModel.insertMany(result.classes);
            console.log(`Đã import ${result.classes.length} lớp học.`);
        }
        res.status(200).json({ 
            message: 'Import dữ liệu thành công!',
            stats: {
                subjects: result.subjects.length,
                classes: result.classes.length
            }
        });
        await DB.disconnectDB();
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ message: 'Error importing data' });
    }
};
module.exports = { importData };
