const parseExcelService = require('../services/parseExcelService');
const classModel = require('../models/classModel');
const subjectModel = require('../models/subjectModel');
const fs = require('fs');
const path = require('path');

const importData = async (req, res) => {
    let excelPath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn file Excel để upload' });
        }

        // Use the uploaded file path
        excelPath = req.file.path;
        console.log('Processing uploaded file:', excelPath);

        const result = await parseExcelService.parseExcel(excelPath);

        console.log('Đang xóa dữ liệu cũ...');
        await classModel.deleteMany({});
        await subjectModel.deleteMany({});

        // Lưu dữ liệu mới vào database
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
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ message: 'Error importing data: ' + error.message });
    } finally {
        if (excelPath && fs.existsSync(excelPath)) {
            try {
                fs.unlinkSync(excelPath);
                console.log('Deleted uploaded file:', excelPath);
            } catch (cleanupError) {
                console.error('Error cleaning up file:', cleanupError);
            }
        }
    }
};
module.exports = { importData };
