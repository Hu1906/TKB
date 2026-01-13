const ClassModel = require('../models/classModel'); // Import model ClassModel để thao tác với cơ sở dữ liệu lớp học
const SubjectModel = require('../models/subjectModel'); // Import model SubjectModel để lấy thông tin môn học

// ---------------------------------------------------------
// PHẦN 1: CÁC HÀM TIỆN ÍCH & TÍNH TOÁN TRƯỚC (UTILS & PRE-COMPUTATION)
// ---------------------------------------------------------

/**
 * Hàm tiền xử lý dữ liệu lớp học để kiểm tra xung đột nhanh hơn.
 * - Chuyển đổi danh sách tuần học thành BitMask (BigInt) để so sánh tuần nhanh.
 * - Chuyển đổi thời gian bắt đầu/kết thúc thành dạng số nguyên (integer) để so sánh thời gian.
 */
const processClassData = (cls) => {
  // 1. Xử lý danh sách các phiên học (Sessions) của lớp
  const processedSessions = cls.sessions.map(sess => {
    // Tạo Bitmask cho các tuần học
    // Ví dụ: sess.weeks = [1, 2, 3] -> sẽ được chuyển thành bitmask: 2^1 | 2^2 | 2^3
    let weekMask = 0n; // Khởi tạo weekMask là 0 (BigInt)
    if (sess.weeks) {
      // Duyệt qua từng tuần học trong mảng weeks
      for (const w of sess.weeks) {
        // Bật bit tại vị trí tương ứng với tuần học 'w'
        // Phép toán (1n << BigInt(...)) tạo ra một số có bit thứ w là 1
        // Phép toán |= (OR) gộp bit đó vào mask tổng
        weekMask |= (1n << BigInt(Math.floor(w)));
      }
    }

    // Chuyển đổi chuỗi thời gian sang số nguyên để dễ so sánh
    // Ví dụ: "1230" thành 1230
    const start = parseInt(sess.start_time);
    const end = parseInt(sess.end_time);

    // Trả về đối tượng session đã được xử lý
    return {
      day: sess.day,    // Ngày học (2, 3, 4, 5, 6, 7, CN)
      start,            // Giờ bắt đầu (dạng số)
      end,              // Giờ kết thúc (dạng số)
      weekMask          // Mask biểu diễn các tuần học
    };
  });

  // Trả về cấu trúc dữ liệu lớp học đã được tối ưu hóa
  return {
    id: cls.class_id,       // Mã lớp
    subject_id: cls.subject_id, // Mã môn học
    type: cls.class_type,   // [Mới] Loại lớp (LT, BT, ...)
    includedId: cls.class_included_id, // [Mới] Mã lớp đi kèm (nếu có)
    processedSessions,      // Danh sách session đã xử lý
    original: cls           // Giữ lại dữ liệu gốc
  };
};

/**
 * Hàm kiểm tra xem hai lớp đã xử lý (processed classes) có bị xung đột lịch hay không.
 * Độ phức tạp: O(N*M) trong đó N, M là số buổi học của mỗi lớp (thường rất nhỏ, 1-3).
 * Sử dụng Bitwise operations (phép toán bit) để kiểm tra trùng tuần cực nhanh.
 */
const checkConflict = (pClassA, pClassB) => {
  // Duyệt qua từng session (buổi học) của lớp A
  for (const sA of pClassA.processedSessions) {
    // Duyệt qua từng session (buổi học) của lớp B
    for (const sB of pClassB.processedSessions) {
      // Nếu không cùng ngày học thì chắc chắn không trùng -> bỏ qua
      if (sA.day !== sB.day) continue;

      // Kiểm tra xem có trùng tuần học nào không bằng phép Bitwise AND (&)
      // Nếu kết quả là 0n nghĩa là không có bit nào chung -> không trùng tuần -> bỏ qua
      if ((sA.weekMask & sB.weekMask) === 0n) continue;

      // Đến đây là: Cùng ngày VÀ Cùng tuần.
      // Sẽ kiểm tra tiếp xem có trùng giờ (Time Overlap) hay không.

      // Logic kiểm tra trùng: khoảng [startA, endA] giao với [startB, endB]
      // Nếu (endA >= startB) VÀ (endB >= startA) thì là có giao nhau.
      if (sA.end >= sB.start && sB.end >= sA.start) {
        return true; // Xung đột tìm thấy
      }
    }
  }
  return false; // Không tìm thấy xung đột nào sau khi duyệt hết
};

/**
     * Helper: Kiểm tra một lớp (hoặc nhóm lớp) có xung đột với một lớp khác không.
     * @param {Array} classListA - Danh sách các lớp (đã xử lý) nhóm A
     * @param {Object} classB - Một lớp (đã xử lý) B
     */
const checkBundleConflict = (classListA, classB) => {
  for (const cA of classListA) {
    if (checkConflict(cA, classB)) return true;
  }
  return false;
}


// ---------------------------------------------------------
// PHẦN 2: THUẬT TOÁN QUAY LUI (OPTIMIZED BACKTRACKING)
// ---------------------------------------------------------

/**
 * Hàm chính để sinh ra các thời khóa biểu hợp lệ từ dữ liệu đầu vào.
 * @param {Array|Object} inputData - Danh sách mã môn học (Array) hoặc Object cấu hình môn học cụ thể.
 */
const generateSchedules = async (inputData) => {
  try {
    let subjectCodes = [];           // Danh sách mã môn học cần xếp
    let specificClassIds = {};       // Map: Mã môn -> [Mã lớp cụ thể user chọn] (nếu có)

    // Xử lý dữ liệu đầu vào (Input Parsing)
    if (Array.isArray(inputData)) {
      subjectCodes = inputData;
    } else if (typeof inputData === 'object' && inputData !== null) {
      subjectCodes = Object.keys(inputData);
      specificClassIds = inputData;
    } else {
      throw new Error("Dữ liệu đầu vào không hợp lệ. Cần là Array hoặc Object.");
    }

    if (subjectCodes.length === 0) {
      return { success: false, message: "Không có môn học nào được chọn." };
    }

    // 1. Lấy dữ liệu từ Database (Fetch Data)
    // 1a. Lấy thông tin Môn học (để check required_lab)
    const subjects = await SubjectModel.find({ subject_id: { $in: subjectCodes } });
    const subjectInfoMap = new Map();
    subjects.forEach(s => subjectInfoMap.set(s.subject_id, s));

    // 1b. Lấy tất cả các lớp học
    const allClasses = await ClassModel.find({
      subject_id: { $in: subjectCodes }
    });

    console.log(`[DEBUG] Đã lấy ${allClasses.length} lớp cho các môn: ${subjectCodes.join(", ")}`);

    // 2. Nhóm, Lọc và Tiền xử lý dữ liệu (Group & Filter & Pre-process)
    const candidatesBySubject = {}; // Object lưu trữ: { Mã môn: [ [Class1, Class2,...], [Option2]... ] }
    // Lưu ý: Bây giờ mỗi "Candidate" là một mảng các lớp (Bundle) chứ không phải 1 lớp đơn lẻ.

    let totalOptions = 0;        // Tổng số lượng phương án chọn

    // Tiền xử lý Conflict Matrix (Global)
    // Ta xây dựng Global Conflict Map cho tất cả các lớp tham gia (đã processed)
    // Để dùng nhanh trong Backtracking
    const globalConflictMap = new Map();

    // Helper: Add to conflict map
    const addToGlobalConflictMap = (pClass) => {
      if (!globalConflictMap.has(pClass.id)) {
        globalConflictMap.set(pClass.id, new Set());
      }
      return globalConflictMap.get(pClass.id);
    }

    // List tạm để chứa tất cả các processedClass dùng cho việc build matrix sau này
    const allProcessedClasses = [];

    for (const code of subjectCodes) {
      const subjectInfo = subjectInfoMap.get(code);
      const isLabRequired = subjectInfo ? subjectInfo.required_lab : false;

      // Lấy tất cả lớp của môn này
      const classesOfSubject = allClasses.filter(c => c.subject_id === code);
      if (classesOfSubject.length === 0) {
        return { success: false, message: `Môn học ${code} không có lớp phù hợp.` };
      }

      // Xây dựng Full Map cho Subject này (để lookup linked classes)
      // Dùng cho việc tìm LT đi kèm, bất kể LT đó có bị filter hay không.
      const fullSubjectClassMap = new Map();
      classesOfSubject.forEach(c => {
        const pc = processClassData(c);
        fullSubjectClassMap.set(pc.id, pc);
        allProcessedClasses.push(pc); // Gom vào list chung để build matrix xung đột sau
      });

      // Phân loại các lớp
      const processedTN = [];   // Danh sách lớp Thí nghiệm
      const processedBT = [];   // Danh sách lớp Bài tập
      const processedLT = [];   // Danh sách lớp Lý thuyết
      const processedCombined = []; // Danh sách lớp kết hợp (LT+BT)
      const processedOthers = []; // Các loại khác

      const linkedLTIds = new Set(); // Set chứa các mã lớp LT đã được lớp BT tham chiếu

      // Lấy bộ lọc user (nếu có)
      const allowed = specificClassIds[code];
      const hasFilter = allowed && Array.isArray(allowed) && allowed.length > 0;

      let hasAnyBT = false;
      let hasAnyCombined = false;

      for (const pClass of fullSubjectClassMap.values()) {
        if (pClass.type === 'BT') hasAnyBT = true;
        if (pClass.type === 'LT+BT') hasAnyCombined = true;

        if (hasFilter && !allowed.includes(pClass.id)) {
          // Lọc candidate gốc
          continue;
        }

        if (pClass.type === 'TN') {
          processedTN.push(pClass);
        } else if (pClass.type === 'BT') {
          if (pClass.includedId) {
            linkedLTIds.add(pClass.includedId);
            processedBT.push(pClass);
          }
        } else if (pClass.type === 'LT') {
          processedLT.push(pClass);
        } else if (pClass.type === 'LT+BT') {
          processedCombined.push(pClass);
        } else {
          processedOthers.push(pClass);
        }
      }

      // Tạo các "Gói" (Bundles) học thuật (Chưa có TN)
      const mainBundles = [];

      // Nhóm 1: Các lớp đã bao gồm cả LT và BT (LT+BT)
      for (const c of processedCombined) {
        mainBundles.push([c]);
      }

      // Nhóm 2: Các lớp LT
      const freeLT = [];

      // 2a. Xử lý BT: Phân loại Linked vs Independent
      for (const btClass of processedBT) {
          // Linked Pair
          const ltClass = fullSubjectClassMap.get(btClass.includedId);
          if (ltClass) {
              mainBundles.push([btClass, ltClass]);
          }
      }

      // 2b. Xử lý LT: Lọc ra LT độc lập (Không bị link bởi BT nào)
      // Lưu ý: Nếu LT được link bởi BT nhưng BT đó bị filter bỏ -> LT đó trở thành "Free"?
      // Hiện tại logic: linkedLTIds chứa ID của những BT *đã qua filter*. -> OK.
      for (const ltClass of processedLT) {
        if (!linkedLTIds.has(ltClass.id)) {
          freeLT.push(ltClass);
        }
      }

      // 2d. Xử lý trường hợp chỉ có LT (Không có BT nào trong môn)
      // Nếu môn học có BT (Linked hoặc Free) hoặc Combined -> System ưu tiên chọn cặp.
      // Nếu không có BT nào -> Chấp nhận LT lẻ.
      if (!hasAnyBT && !hasAnyCombined) {
        for (const lt of freeLT) {
          mainBundles.push([lt]);
        }
      }

      // 3. Các loại khác
      for (const other of processedOthers) {
        mainBundles.push([other]);
      }

      // Nếu không có bundle học thuật nào
      if (mainBundles.length === 0) {
        return { success: false, message: `Môn học ${code} không có phương án chọn lớp Lý thuyết/Bài tập phù hợp.` };
      }

      // Tạo "Gói" cuối cùng (kết hợp với Lab nếu cần)
      const subjectBundles = [];

      if (isLabRequired) {
        // Bắt buộc phải có TN
        if (processedTN.length === 0) {
          return { success: false, message: `Môn học ${code} bắt buộc có Thực hành (TN) nhưng không tìm thấy lớp TN nào.` };
        }

        const validTNClasses = hasFilter
          ? processedTN.filter(tn => allowed.includes(tn.id))
          : processedTN;

        if (validTNClasses.length === 0) {
          return { success: false, message: `Môn học ${code} không có lớp TN phù hợp.` };
        }

        for (const bundle of mainBundles) {
          for (const tnClass of validTNClasses) {
            // Ghép [Bundle] + [TN]
            if (!checkBundleConflict(bundle, tnClass)) {
              subjectBundles.push([...bundle, tnClass]);
            }
          }
        }
      } else {
        // Không cần TN
        for (const b of mainBundles) subjectBundles.push(b);
      }

      // Check lại lần cuối
      if (subjectBundles.length === 0) {
        return { success: false, message: `Môn học ${code} không có phương án chọn lớp (xung đột hoặc thiếu thành phần).` };
      }

      candidatesBySubject[code] = subjectBundles;
      totalOptions += subjectBundles.length;
    }

    // 3. Xây dựng Ma trận xung đột (Conflict Matrix)
    // Build cho tất cả các lớp đã xuất hiện trong các candidates
    // (Thực ra ta có thể build cho toàn bộ allProcessedClasses để bao quát hết)

    allProcessedClasses.forEach(c => addToGlobalConflictMap(c));

    for (let i = 0; i < allProcessedClasses.length; i++) {
      for (let j = i + 1; j < allProcessedClasses.length; j++) {
        const cA = allProcessedClasses[i];
        const cB = allProcessedClasses[j];

        // Cùng môn thì coi như không cần check conflict ở đây (vì Backtracking chọn 1 bundle cho 1 môn)
        // (Trừ khi trong bundle có nhiều lớp, nhưng ta đã check bundle valid ở bước 2 rồi)
        if (cA.subject_id === cB.subject_id) continue;

        if (checkConflict(cA, cB)) {
          globalConflictMap.get(cA.id).add(cB.id);
          globalConflictMap.get(cB.id).add(cA.id);
        }
      }
    }

    // 4. Sắp xếp môn học (MRV)
    subjectCodes.sort((a, b) => candidatesBySubject[a].length - candidatesBySubject[b].length);

    // 5. Quay lui (Backtracking)
    const validSchedules = [];
    const LIMIT_RESULTS = 1000;

    const backtrack = (subjectIndex, currentScheduleIds) => {
      if (validSchedules.length >= LIMIT_RESULTS) return;

      if (subjectIndex === subjectCodes.length) {
        // Done
        const fullSchedule = currentScheduleIds.map(p => p.original);
        validSchedules.push(fullSchedule);
        return;
      }

      const subjectCode = subjectCodes[subjectIndex];
      const bundles = candidatesBySubject[subjectCode]; // Đây là mảng các [Class1, Class2...]

      for (const bundle of bundles) {
        let isSafe = true;

        // Check conflict của CẢ GÓI với header hiện tại
        for (const candidate of bundle) {
          const candidateConflicts = globalConflictMap.get(candidate.id);
          for (const picked of currentScheduleIds) {
            if (candidateConflicts.has(picked.id)) {
              isSafe = false;
              break;
            }
          }
          if (!isSafe) break;
        }

        if (isSafe) {
          // Thêm cả gói vào
          bundle.forEach(c => currentScheduleIds.push(c));

          backtrack(subjectIndex + 1, currentScheduleIds);

          // Pop ra (đúng số lượng đã push)
          for (let k = 0; k < bundle.length; k++) {
            currentScheduleIds.pop();
          }
        }
      }
    };

    backtrack(0, []);

    console.log(`[DEBUG] Backtracking hoàn tất. Tìm thấy ${validSchedules.length} TKB hợp lệ.`);

    return {
      success: validSchedules.length > 0,
      message: validSchedules.length === 0 ? "Không tìm thấy phương án xếp lịch nào phù hợp." : "Xếp lịch thành công!",
      schedules: validSchedules,
      total_found: validSchedules.length,
      limit_reached: validSchedules.length >= LIMIT_RESULTS
    };

  } catch (error) {
    console.error("Scheduler Error:", error);
    throw error;
  }
};

module.exports = { generateSchedules };