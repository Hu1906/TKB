// ---------------------------------------------------------
// PHẦN 1: UTILS & PRE-COMPUTATION
// ---------------------------------------------------------

/**
 * Pre-process class data for faster conflict checks.
 * - Convert weeks to BitMask (BigInt)
 * - Convert time to minutes
 */
const processClassData = (cls) => {
  // 1. Process Sessions
  const processedSessions = cls.sessions.map(sess => {
    // Week Bitmask
    // Weeks array: [1, 2, 3] -> 2^1 | 2^2 | 2^3
    let weekMask = 0n;
    if (sess.weeks) {
      for (const w of sess.weeks) {
        weekMask |= (1n << BigInt(w));
      }
    }

    // Time to integer
    const start = parseInt(sess.start_time);
    const end = parseInt(sess.end_time);

    return {
      day: sess.day,
      start,
      end,
      weekMask
    };
  });

  return {
    id: cls.class_id, // or _id
    subject_id: cls.subject_id,
    processedSessions,
    original: cls
  };
};

/**
 * Check if two processed classes conflict.
 * O(N*M) where N, M are number of sessions (usually small, 1-3).
 * Uses Bitwise operations for weeks.
 */
const checkConflict = (pClassA, pClassB) => {
  for (const sA of pClassA.processedSessions) {
    for (const sB of pClassB.processedSessions) {
      // Must be same day to conflict
      if (sA.day !== sB.day) continue;

      // Check Week Overlap (Bitwise AND)
      if ((sA.weekMask & sB.weekMask) === 0n) continue;

      // Check Time Overlap
      // Conflict if: max(startA, startB) <= min(endA, endB)
      // Or !(endA < startB || endB < startA)
      // Note: HUST time "0645" as int 645 works for comparison? 
      // Yes: 645 < 730 is true. 645 < 1230 is true.
      // As long as no rollover (not 24h), it works.
      if (sA.end >= sB.start && sB.end >= sA.start) {
        return true;
      }
    }
  }
  return false;
};

// ---------------------------------------------------------
// PHẦN 2: THUẬT TOÁN QUAY LUI (OPTIMIZED)
// ---------------------------------------------------------

const generateSchedules = async (inputData) => {
  try {
    let subjectCodes = [];
    let specificClassIds = {}; // Map: SubjectCode -> [ClassID1, ClassID2]

    // Parse Input
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

    // 1. Fetch Data
    const allClasses = await ClassModel.find({
      subject_id: { $in: subjectCodes }
    });

    // 2. Group & Filter & Pre-process
    const candidatesBySubject = {}; // { subjectCode: [ProcessedClass] }
    let totalCandidates = 0;

    for (const code of subjectCodes) {
      let classesOfSubject = allClasses.filter(c => c.subject_id === code);
      const allowed = specificClassIds[code];

      if (allowed && Array.isArray(allowed) && allowed.length > 0) {
        classesOfSubject = classesOfSubject.filter(c => allowed.includes(c.class_id));
      }

      if (classesOfSubject.length === 0) {
        return { success: false, message: `Môn học ${code} không có lớp phù hợp.` };
      }

      candidatesBySubject[code] = classesOfSubject.map(processClassData);
      totalCandidates += candidatesBySubject[code].length;
    }

    // 3. Optimization: Sort Subjects by "Minimum Remaining Values" (MRV)
    // Process subjects with fewer candidates first to prune tree early.
    subjectCodes.sort((a, b) => candidatesBySubject[a].length - candidatesBySubject[b].length);

    // 4. Pre-compute Conflict Matrix (Optional but fast for medium datasets)
    // If Total Candidates < 2000, O(N^2) is fine (4M ops).
    // Let's build a Map: classId -> Set of conflicting classIds
    // Only need to check conflicts between different subjects. 
    // But for simplicity/speed inside recurse, we can just cache pairs.

    // Actually, with BitMask check, `checkConflict` is extremely fast. 
    // We might skip full Matrix if N is huge. 
    // But for Timetable (usually < 200 classes total involved), Matrix is instant.

    const conflictMap = new Map(); // Key: classId, Value: Set<classId>
    const allCandidatesFlattened = Object.values(candidatesBySubject).flat();

    // Initialize map
    allCandidatesFlattened.forEach(c => conflictMap.set(c.id, new Set()));

    // Build Graph
    // Only need to check between different subjects, strictly speaking.
    // But iterating all pairs is safe.
    for (let i = 0; i < allCandidatesFlattened.length; i++) {
      for (let j = i + 1; j < allCandidatesFlattened.length; j++) {
        const cA = allCandidatesFlattened[i];
        const cB = allCandidatesFlattened[j];

        // Optimization: Don't check if same subject (can't pick both anyway)
        if (cA.subject_id === cB.subject_id) continue;

        if (checkConflict(cA, cB)) {
          conflictMap.get(cA.id).add(cB.id);
          conflictMap.get(cB.id).add(cA.id);
        }
      }
    }

    // 5. Backtracking
    const validSchedules = [];
    const LIMIT_RESULTS = 500; // Limit to 500 best results

    const backtrack = (subjectIndex, currentScheduleIds) => {
      if (validSchedules.length >= LIMIT_RESULTS) return;

      if (subjectIndex === subjectCodes.length) {
        // Done - Retrieve original objects
        // currentScheduleIds is array of PClass objects for speed, or just retrieve later
        // We'll pass processed objects in recursion
        const fullSchedule = currentScheduleIds.map(p => p.original);
        validSchedules.push(fullSchedule);
        return;
      }

      const subjectCode = subjectCodes[subjectIndex];
      const candidates = candidatesBySubject[subjectCode];

      for (const candidate of candidates) {
        let isSafe = true;

        // Fast Conflict Check using Matrix
        // Check if candidate conflicts with any in currentSchedule
        const candidateConflicts = conflictMap.get(candidate.id);

        for (const picked of currentScheduleIds) {
          if (candidateConflicts.has(picked.id)) {
            isSafe = false;
            break;
          }
        }

        if (isSafe) {
          currentScheduleIds.push(candidate);
          backtrack(subjectIndex + 1, currentScheduleIds);
          currentScheduleIds.pop();
        }
      }
    };

    backtrack(0, []);

    return {
      success: true,
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