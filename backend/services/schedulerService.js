const ClassModel = require('../models/classModel');

/**
 * ---------------------------------------------------------
 * PHẦN 1: CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS)
 * Logic này được chuyển thể từ repo hungitb nhưng tối ưu hơn
 * nhờ việc dữ liệu 'weeks' đã được parse thành mảng số.
 * ---------------------------------------------------------
 */

// Kiểm tra 2 mảng tuần có phần tử chung không
// Ví dụ: [2,3,4] và [4,5,6] -> Trùng tuần 4 -> True
const hasCommonWeek = (weeksA, weeksB) => {
  // Cách tối ưu: Dùng Set hoặc phương thức some/includes
  // Vì mảng tuần thường ngắn (<20 phần tử) nên loop lồng nhau vẫn rất nhanh
  for (const wA of weeksA) {
    if (weeksB.includes(wA)) return true;
  }
  return false;
};

// Kiểm tra trùng lịch giữa 2 khung giờ (Session)
const isSessionConflict = (sessionA, sessionB) => {
  // 1. Khác ngày -> Không trùng
  if (sessionA.day !== sessionB.day) return false;

  // 2. Không cùng tuần học -> Không trùng
  // (Ví dụ: A học tuần chẵn, B học tuần lẻ -> Vẫn học được)
  if (!hasCommonWeek(sessionA.weeks, sessionB.weeks)) return false;

  // 3. Kiểm tra giao nhau về thời gian (Overlap)
  // Công thức toán học: max(start1, start2) <= min(end1, end2)
  // Ví dụ: A(1-3), B(3-5) -> max(1,3)=3 <= min(3,5)=3 -> Trùng tiết 3
  const start = Math.max(parseInt(sessionA.start_period), parseInt(sessionB.start_period));
  const end = Math.min(parseInt(sessionA.end_period), parseInt(sessionB.end_period));

  return start <= end; // True nếu trùng
};

// Kiểm tra trùng lịch giữa 2 Lớp học (Class Object)
// Một lớp có thể có nhiều session (VD: Lý thuyết T2, Bài tập T5)
const isClassConflict = (classA, classB) => {
  for (const sesA of classA.sessions) {
    for (const sesB of classB.sessions) {
      if (isSessionConflict(sesA, sesB)) return true;
    }
  }
  return false;
};

/**
 * ---------------------------------------------------------
 * PHẦN 2: THUẬT TOÁN QUAY LUI (BACKTRACKING)
 * Tìm tất cả các tổ hợp môn học không bị trùng.
 * ---------------------------------------------------------
 */

const generateSchedules = async (subjectCodes) => {
  try {
    // Bước 1: Lấy dữ liệu từ MongoDB
    // Chỉ lấy các lớp thuộc danh sách môn người dùng chọn
    const allClasses = await ClassModel.find({ 
      subject_id: { $in: subjectCodes } 
    });

    // Bước 2: Gom nhóm các lớp theo môn học
    // Kết quả: { "IT1110": [ClassObj1, ClassObj2...], "MI1111": [...] }
    const classesBySubject = {};
    for (const code of subjectCodes) {
      const classesOfSubject = allClasses.filter(c => c.subject_id === code);
      
      // Nếu có môn nào không có lớp mở -> Không thể xếp lịch -> Báo lỗi ngay
      if (classesOfSubject.length === 0) {
        return { 
          success: false, 
          message: `Môn học ${code} hiện không có lớp mở hoặc không tìm thấy.` 
        };
      }
      classesBySubject[code] = classesOfSubject;
    }

    // Bước 3: Chạy thuật toán Backtracking
    const validSchedules = [];
    const LIMIT_RESULTS = 1000; // Giới hạn để tránh sập server nếu tổ hợp quá lớn

    const backtrack = (subjectIndex, currentSchedule) => {
      // Điều kiện dừng: Đã tìm đủ số lượng giới hạn
      if (validSchedules.length >= LIMIT_RESULTS) return;

      // Base case: Nếu đã chọn đủ lớp cho tất cả các môn
      if (subjectIndex === subjectCodes.length) {
        validSchedules.push([...currentSchedule]);
        return;
      }

      // Lấy danh sách lớp của môn hiện tại
      const currentSubjectCode = subjectCodes[subjectIndex];
      const candidates = classesBySubject[currentSubjectCode];

      // Thử chọn từng lớp trong danh sách ứng viên
      for (const candidateClass of candidates) {
        let isSafe = true;

        // Kiểm tra xem lớp này có trùng với các lớp đã chọn trước đó không
        for (const existingClass of currentSchedule) {
          if (isClassConflict(candidateClass, existingClass)) {
            isSafe = false;
            break; // Trùng thì bỏ qua ngay
          }
        }

        // Nếu an toàn, chọn lớp này và đi tiếp sang môn sau
        if (isSafe) {
          currentSchedule.push(candidateClass);
          backtrack(subjectIndex + 1, currentSchedule);
          currentSchedule.pop(); // Backtrack: Bỏ chọn để thử lớp khác
        }
      }
    };

    // Bắt đầu đệ quy từ môn đầu tiên
    backtrack(0, []);

    return {
      success: true,
      data: validSchedules,
      total_found: validSchedules.length,
      limit_reached: validSchedules.length >= LIMIT_RESULTS
    };

  } catch (error) {
    console.error("Lỗi thuật toán xếp lịch:", error);
    throw error;
  }
};

module.exports = { generateSchedules };