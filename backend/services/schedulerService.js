const ClassModel = require('../models/classModel');

/**
 * ---------------------------------------------------------
 * PHẦN 1: CÁC HÀM KIỂM TRA XUNG ĐỘT (CONFLICT CHECKERS)
 * ---------------------------------------------------------
 */

// Kiểm tra 2 mảng tuần có phần tử chung không
const hasCommonWeek = (weeksA, weeksB) => {
  if (!weeksA || !weeksB) return false;
  for (const wA of weeksA) {
    if (weeksB.includes(wA)) return true;
  }
  return false;
};

// Kiểm tra trùng lịch giữa 2 khung giờ (Session)
// Sử dụng start_time/end_time dạng String ("0645", "1230")
const isSessionConflict = (sessionA, sessionB) => {
  // 1. Khác ngày -> Không trùng
  if (sessionA.day !== sessionB.day) return false;

  // 2. Không cùng tuần học -> Không trùng
  if (!hasCommonWeek(sessionA.weeks, sessionB.weeks)) return false;

  // 3. Kiểm tra giao nhau về thời gian (String Comparison)
  // Vì định dạng giờ là HHmm (VD: "0645", "1230") nên có thể so sánh chuỗi trực tiếp.
  // Công thức Overlap: max(startA, startB) <= min(endA, endB)
  // Nếu A xong trước khi B bắt đầu, hoặc B xong trước khi A bắt đầu -> Không trùng

  // Logic ngược: Không trùng khi (EndA < StartB) hoặc (EndB < StartA)
  // => Trùng khi: !(EndA < StartB || EndB < StartA)
  // => Trùng khi: EndA >= StartB && EndB >= StartA

  if (sessionA.end_time >= sessionB.start_time && sessionB.end_time >= sessionA.start_time) {
    return true;
  }

  return false;
};

// Kiểm tra trùng lịch giữa 2 Lớp học (Class Object)
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
 * ---------------------------------------------------------
 */

/**
 * Hàm tạo thời khóa biểu dựa trên danh sách lớp được chọn.
 * @param {Array} subjectsRequest - Danh sách yêu cầu từ Frontend.
 * Cấu trúc input mong đợi:
 * [
 * { subjectCode: "IT1110", classCodes: ["123456", "123457"] }, // Chỉ xếp 2 lớp này
 * { subjectCode: "MI1111", classCodes: [] } // Nếu rỗng -> Hiểu là lấy TẤT CẢ lớp của môn này 
 * ]
 */
const generateSchedules = async (inputData) => {
  try {
    let subjectCodes = [];
    let specificClassIds = {}; // Map: SubjectCode -> [ClassID1, ClassID2]

  
    if (Array.isArray(inputData)) {
      // Case 1: Input là mảng mã môn -> ["IT1110", "MI1111"]
      // Mặc định là lấy tất cả các lớp
      subjectCodes = inputData;
    } else if (typeof inputData === 'object' && inputData !== null) {
      // Case 2: Input là Object -> { "IT1110": ["123456"], "MI1111": [] }
      // Key là mã môn, Value là danh sách mã lớp muốn học (Rỗng = lấy hết)
      subjectCodes = Object.keys(inputData);
      specificClassIds = inputData;
    } else {
      throw new Error("Dữ liệu đầu vào không hợp lệ. Cần là Array hoặc Object.");
    }

    if (subjectCodes.length === 0) {
      return { success: false, message: "Không có môn học nào được chọn." };
    }

    // Bước 1: Lấy dữ liệu từ MongoDB
    // Vẫn lấy tất cả các lớp thuộc danh sách môn để xử lý
    const allClasses = await ClassModel.find({
      subject_id: { $in: subjectCodes }
    });

    // Bước 2: Gom nhóm các lớp theo môn học & Áp dụng bộ lọc (Filter)
    const classesBySubject = {};

    for (const code of subjectCodes) {
      let classesOfSubject = allClasses.filter(c => c.subject_id === code);

      // LOGIC MỚI: Lọc theo danh sách lớp cụ thể nếu có yêu cầu
      const allowedClasses = specificClassIds[code];
      if (allowedClasses && Array.isArray(allowedClasses) && allowedClasses.length > 0) {
        // Chỉ giữ lại các lớp có class_id nằm trong danh sách người dùng chọn
        classesOfSubject = classesOfSubject.filter(c => allowedClasses.includes(c.class_id));
      }

      // Kiểm tra nếu sau khi lọc mà không còn lớp nào
      if (classesOfSubject.length === 0) {
        return {
          success: false,
          message: `Môn học ${code} không tìm thấy lớp phù hợp (hoặc mã lớp bạn chọn không tồn tại).`
        };
      }
      classesBySubject[code] = classesOfSubject;
    }

    // Bước 3: Chạy thuật toán Backtracking
    const validSchedules = [];
    const LIMIT_RESULTS = 1000;

    const backtrack = (subjectIndex, currentSchedule) => {
      // Điều kiện dừng
      if (validSchedules.length >= LIMIT_RESULTS) return;

      // Base case: Đã xếp đủ môn
      if (subjectIndex === subjectCodes.length) {
        validSchedules.push([...currentSchedule]);
        return;
      }

      const currentSubjectCode = subjectCodes[subjectIndex];
      const candidates = classesBySubject[currentSubjectCode];

      // Thử chọn từng lớp trong danh sách ứng viên
      for (const candidateClass of candidates) {
        let isSafe = true;

        // Kiểm tra trùng lịch với các lớp đã chọn
        for (const existingClass of currentSchedule) {
          if (isClassConflict(candidateClass, existingClass)) {
            isSafe = false;
            break;
          }
        }

        if (isSafe) {
          currentSchedule.push(candidateClass);
          backtrack(subjectIndex + 1, currentSchedule);
          currentSchedule.pop(); // Backtrack
        }
      }
    };

    // Bắt đầu đệ quy
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