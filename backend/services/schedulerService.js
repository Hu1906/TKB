const ClassModel = require('../models/classModel');

// ---------------------------------------------------------
// PHẦN 1: UTILS & PRE-COMPUTATION
// ---------------------------------------------------------

/**
 * Pre-process class data for faster conflict checks.
 */
const processClassData = (cls) => {
  const processedSessions = cls.sessions.map(sess => {
    let weekMask = 0n;
    if (sess.weeks) {
      for (const w of sess.weeks) {
        weekMask |= (1n << BigInt(w));
      }
    }
    const start = parseInt(sess.start_time);
    const end = parseInt(sess.end_time);
    return { day: sess.day, start, end, weekMask };
  });

  return {
    id: cls.class_id,
    subject_id: cls.subject_id,
    class_type: cls.class_type, // Vital for grouping
    processedSessions,
    original: cls
  };
};

/**
 * Check conflict between two processed classes.
 */
const checkConflict = (pClassA, pClassB) => {
  for (const sA of pClassA.processedSessions) {
    for (const sB of pClassB.processedSessions) {
      if (sA.day !== sB.day) continue;
      if ((sA.weekMask & sB.weekMask) === 0n) continue;
      if (sA.end >= sB.start && sB.end >= sA.start) return true;
    }
  }
  return false;
};

// ---------------------------------------------------------
// PHẦN 2: GENERATE CONFIGURATIONS (ENSEMBLES)
// ---------------------------------------------------------

/**
 * Generates valid "Ensembles" (combinations of classes) for a single subject
 * based on HUST rules:
 * - Theory part: (LT+BT) OR (LT + BT) OR (LT if no BT) OR (BT if no LT - rare)
 * - Experiment part: If TN exists, MUST pick one TN.
 * 
 * @param {Array} processedClasses - All processed classes for this subject
 * @returns {Array} Array of Ensembles. Each Ensemble is an Array of ProcessedClasses.
 */
const generateSubjectEnsembles = (processedClasses) => {
  const types = {
    'LT': [],
    'BT': [],
    'LT+BT': [],
    'TN': [],
    'OTHER': []
  };

  // Group by type
  // Normalize type: "lt", "LT", "Lt" -> "LT"
  for (const pCls of processedClasses) {
    let t = pCls.class_type ? pCls.class_type.toUpperCase().trim() : 'OTHER';
    // Handle variations if potential data dirtiness? 
    if (t === 'TH') t = 'TN'; // Sometimes TH/TN used interchangeably for practice/experiment? HUST usually TN. TH is Thuc Hanh.
    // Let's assume standard: LT, BT, LT+BT, TN.

    if (types[t]) types[t].push(pCls);
    else types['OTHER'].push(pCls);
  }

  // 1. Generate Base Options (Theory/Exercise Component)
  let baseOptions = []; // Array of [pClass] or [pClass1, pClass2]

  const hasCombine = types['LT+BT'].length > 0;
  const hasLT = types['LT'].length > 0;
  const hasBT = types['BT'].length > 0;

  // Strategy:
  // If LT+BT exists, they are valid base options.
  if (hasCombine) {
    types['LT+BT'].forEach(c => baseOptions.push([c]));
  }

  // If separate LT and BT exist, pairs are valid options.
  if (hasLT && hasBT) {
    // Cross product LT x BT
    // Check internal conflict!
    for (const lt of types['LT']) {
      for (const bt of types['BT']) {
        if (!checkConflict(lt, bt)) {
          baseOptions.push([lt, bt]);
        }
      }
    }
  } else if (hasLT && !hasBT && !hasCombine) {
    // Only LT available (maybe pure theory subject)
    types['LT'].forEach(c => baseOptions.push([c]));
  } else if (!hasLT && hasBT && !hasCombine) {
    // Only BT? Rare.
    types['BT'].forEach(c => baseOptions.push([c]));
  } else if (!hasCombine && !hasLT && !hasBT) {
    // Maybe "OTHER" or empty types?
    types['OTHER'].forEach(c => baseOptions.push([c]));
  }

  // If we have both (LT+BT) AND (LT, BT), we now have both types of options in baseOptions.
  // If baseOptions is empty but we have classes? (e.g. only TN?). 
  // If only TN exists, likely a "Thinking" error or it's a special lab subject.
  // But usually TN is attached to a course.
  // If baseOptions is empty here, we might fall back to "Pick any 1 class" logic?
  if (baseOptions.length === 0 && processedClasses.length > 0 && types['TN'].length === 0) {
    // Fallback: Treat every class as a standalone option if not TN
    processedClasses.filter(c => c.class_type !== 'TN').forEach(c => baseOptions.push([c]));
  }


  // 2. Add Experiment (TN) Component
  // If TN exists, we must cross-product BaseOptions x TN
  const tnClasses = types['TN'];
  if (tnClasses.length > 0) {
    const finalEnsembles = [];
    // If BaseOptions empty (e.g. strict Lab course?), use empty base?
    // Let's assume if baseOptions empty, we just pick TN?
    if (baseOptions.length === 0) {
      tnClasses.forEach(tn => finalEnsembles.push([tn]));
    } else {
      for (const base of baseOptions) {
        for (const tn of tnClasses) {
          // Check conflict between TN and Base classes
          let isCompatible = true;
          for (const baseCls of base) {
            if (checkConflict(baseCls, tn)) {
              isCompatible = false;
              break;
            }
          }
          if (isCompatible) {
            finalEnsembles.push([...base, tn]);
          }
        }
      }
    }
    return finalEnsembles;
  }

  return baseOptions;
};


// ---------------------------------------------------------
// PHẦN 3: THUẬT TOÁN QUAY LUI (MAIN)
// ---------------------------------------------------------

const generateSchedules = async (inputData) => {
  try {
    let subjectCodes = [];
    let specificClassIds = {};

    if (Array.isArray(inputData)) {
      subjectCodes = inputData;
    } else if (typeof inputData === 'object' && inputData !== null) {
      subjectCodes = Object.keys(inputData);
      specificClassIds = inputData;
    } else {
      throw new Error("Dữ liệu đầu vào không hợp lệ.");
    }

    if (subjectCodes.length === 0) {
      return { success: false, message: "Không có môn học nào được chọn." };
    }

    // 1. Fetch Data
    const allClasses = await ClassModel.find({
      subject_id: { $in: subjectCodes }
    });

    // 2. Build Options per Subject
    const optionsBySubject = {}; // { IT1110: [ [ClassA], [ClassB, ClassC]... ] }
    let totalOptions = 0;

    for (const code of subjectCodes) {
      let classesOfSubject = allClasses.filter(c => c.subject_id === code);
      const allowed = specificClassIds[code];

      // Filter specific classes first? 
      // Warning: If we filter specific classes, we might break LT+BT pairing if user selects only LT.
      // But assume user selects "Course" or "Specific Classes".
      // If specific classes provided, we only use those.
      if (allowed && Array.isArray(allowed) && allowed.length > 0) {
        classesOfSubject = classesOfSubject.filter(c => allowed.includes(c.class_id));
      }

      if (classesOfSubject.length === 0) {
        return { success: false, message: `Môn học ${code} không có lớp phù hợp.` };
      }

      const processed = classesOfSubject.map(processClassData);
      const ensembles = generateSubjectEnsembles(processed);

      if (ensembles.length === 0) {
        return { success: false, message: `Không tìm thấy tổ hợp lớp hợp lệ cho môn ${code} (ví dụ: thiếu lớp BT hoặc TN tương thích).` };
      }

      optionsBySubject[code] = ensembles;
      totalOptions += ensembles.length;
    }

    // 3. MRV Sort
    subjectCodes.sort((a, b) => optionsBySubject[a].length - optionsBySubject[b].length);

    // 4. Backtracking
    const validSchedules = [];
    const LIMIT_RESULTS = 500;

    // Cache conflicts between SINGLE classes to speed up Ensemble checks?
    // Or just checking Ensemble vs Ensemble on the fly.
    // Ensemble size is small (1-3). checking EnsembleA vs EnsembleB is 1*1 to 3*3 = 9 checks max. Very fast.
    // Conflict Matrix for individual classes is still useful.

    // Let's build global conflict map for all individual classes involved.
    const allInvolvedClasses = Object.values(optionsBySubject).flat().flat(); // Flatten Ensembles -> Flatten Classes
    // ... (Optional: Build Map if performance needed. skipping for code clarity unless slow).
    // Direct checks are sufficient for <1000 classes.

    const backtrack = (subjectIndex, currentClasses) => {
      if (validSchedules.length >= LIMIT_RESULTS) return;

      if (subjectIndex === subjectCodes.length) {
        const fullSchedule = currentClasses.map(p => p.original);
        validSchedules.push(fullSchedule);
        return;
      }

      const code = subjectCodes[subjectIndex];
      const ensembles = optionsBySubject[code];

      for (const ensemble of ensembles) {
        // Check if this ensemble conflicts with anything in currentClasses
        let isSafe = true;

        // Loop current picked classes
        for (const picked of currentClasses) {
          // Loop classes in candidate ensemble
          for (const candidate of ensemble) {
            if (checkConflict(candidate, picked)) {
              isSafe = false;
              break;
            }
          }
          if (!isSafe) break;
        }

        if (isSafe) {
          // Push all classes of ensemble
          // Optimization: currentClasses.push(...ensemble)
          // But need to pop correctly.
          const len = currentClasses.length;
          for (const c of ensemble) currentClasses.push(c);

          backtrack(subjectIndex + 1, currentClasses);

          // Pop back
          while (currentClasses.length > len) currentClasses.pop();
        }
      }
    };

    backtrack(0, []);

    return {
      success: true,
      schedules: validSchedules, // Each schedule is [ClassObj, ClassObj...]
      total_found: validSchedules.length,
      limit_reached: validSchedules.length >= LIMIT_RESULTS
    };

  } catch (error) {
    console.error("Scheduler Error:", error);
    throw error;
  }
};

module.exports = { generateSchedules };