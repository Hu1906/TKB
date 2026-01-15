const { generateSchedules } = require('../services/schedulerService');

const generateTKB = async (req, res) => {
  try {
    const { subjectCodes, advancedSettings } = req.body;

    // --- KIỂM TRA DỮ LIỆU ĐẦU VÀO (VALIDATION) ---
    const isArray = Array.isArray(subjectCodes);
    const isObject = typeof subjectCodes === 'object' && subjectCodes !== null && !isArray;

    let isValid = false;

    // Nếu là Array: Không được rỗng
    if (isArray && subjectCodes.length > 0) {
      isValid = true;
    }
    // Nếu là Object: Phải có ít nhất 1 key (môn học)
    else if (isObject && Object.keys(subjectCodes).length > 0) {
      isValid = true;
    }

    if (!isValid) {
      return res.status(400).json({
        message: "Vui lòng gửi danh sách môn học hợp lệ (Array mã môn hoặc Object kèm mã lớp)."
      });
    }

    // Log thông tin để debug
    if (isArray) {
      console.log(`Đang xếp lịch (Mode: Auto): ${subjectCodes.join(", ")}...`);
    } else {
      console.log(`Đang xếp lịch (Mode: Filter): ${Object.keys(subjectCodes).join(", ")}...`);
    }

    const result = await generateSchedules(subjectCodes, advancedSettings);

    if (result.total_found === 0) {
      return res.status(400).json({
        message: result.message || "Không tìm thấy phương án xếp lịch nào phù hợp.",
        count: 0,
        schedules: []
      });
    }

    // Trả kết quả thành công
    res.status(200).json({
      message: "Xếp lịch thành công!",
      count: result.total_found,
      is_limit_reached: result.limit_reached,
      schedules: result.schedules // Danh sách các phương án
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi Server khi xếp lịch." });
  }
};

module.exports = { generateTKB };