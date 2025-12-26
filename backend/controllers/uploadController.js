const fs = require('fs');
const { importDataFromExcel } = require('../config/importData');

const handleUploadData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        await importDataFromExcel(req.file.path);
        fs.unlinkSync(req.file.path); // Xóa file sau khi xử lý

        res.status(200).json({ message: 'File processed successfully' });
    } catch (error) {
        if (req.file) {
            fs.unlinkSync(req.file.path); // Xóa file nếu có lỗi xảy ra
        }
        console.error('Error processing file:', error);
        res.status(500).json({ message: 'Error processing file' });
    }
};
module.exports = { handleUploadData };
