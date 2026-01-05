const DB = require('../config/db');
const parseExcelService = require('../services/parseExcelService');
const classModel = require('../models/classModel');
const subjectModel = require('../models/subjectModel');


const importData = async (req, res) => {
    try {
        DB.connectDB();
        const result = await parseExcelService.parseExcelFile('data/data.xlsx');
        // Lưu dữ liệu vào database
        classModel.insertMany(result.classes);
        subjectModel.insertMany(result.subjects);
        res.status(200).json({ message: 'Data imported successfully' });
        DB.disconnectDB();
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ message: 'Error importing data' });
    }
};
module.exports = { importData };
