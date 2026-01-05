const { generateSchedules } = require('../services/schedulerService');

const generateTKB = async (req, res) => {
  try {
    // Lấy danh sách mã môn từ body request
    // Ví dụ: { "subjectCodes": ["IT1110", "MI1111", "PH1111"] }
    const { subjectCodes } = req.body;

    if (!subjectCodes || !Array.isArray(subjectCodes) || subjectCodes.length === 0) {
      return res.status(400).json({ 
        message: "Vui lòng gửi danh sách mã môn học (Array)." 
      });
    }

    console.log(`Đang xếp lịch cho các môn: ${subjectCodes.join(", ")}...`);

    // Gọi service xử lý
    const result = await generateSchedules(subjectCodes);

    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }

    // Trả kết quả thành công
    res.status(200).json({
      message: "Xếp lịch thành công!",
      count: result.total_found,
      is_limit_reached: result.limit_reached,
      schedules: result.data // Danh sách các phương án
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server khi xếp lịch." });
  }
};

module.exports = { generateTKB };