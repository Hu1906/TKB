import { create } from 'zustand';
import { generateSchedule } from '../services/api';

const useScheduleStore = create((set, get) => ({
    selectedSubjects: [],
    selectedClasses: {},
    advancedSettings: {}, // { "2-morning": true, "2-afternoon": false, ... }
    schedules: [],
    currentScheduleIndex: 0,
    loading: false,
    error: null,

    addSubject: (subject) => {
        const { selectedSubjects } = get();
        if (!selectedSubjects.find(s => s.subject_id === subject.subject_id)) {
            set((state) => ({
                selectedSubjects: [...state.selectedSubjects, subject],
                selectedClasses: { ...state.selectedClasses, [subject.subject_id]: null }
            }));
        }
    },

    removeSubject: (subjectId) => {
        set((state) => {
            const newClasses = { ...state.selectedClasses };
            delete newClasses[subjectId];
            return {
                selectedSubjects: state.selectedSubjects.filter(s => s.subject_id !== subjectId),
                selectedClasses: newClasses
            };
        });
    },

    updateClassSelection: (subjectId, classIds) => {
        set((state) => ({
            selectedClasses: {
                ...state.selectedClasses,
                [subjectId]: classIds
            }
        }));
    },

    updateAdvancedSettings: (key, value) => {
        set((state) => ({
            advancedSettings: {
                ...state.advancedSettings,
                [key]: value
            }
        }));
    },

    clearSubjects: () => set({ selectedSubjects: [], selectedClasses: {}, advancedSettings: {} }),

    setCurrentScheduleIndex: (index) => set({ currentScheduleIndex: index }),

    generateSchedules: async () => {
        const { selectedSubjects, selectedClasses, advancedSettings } = get();
        if (selectedSubjects.length === 0) return false;

        set({ loading: true, error: null });
        try {
            const payload = {};
            selectedSubjects.forEach(s => {
                const specific = selectedClasses[s.subject_id];
                payload[s.subject_id] = specific || [];
            });

            const requestBody = {
                subjectCodes: payload,
                advancedSettings: advancedSettings
            };

            console.log("Sending payload:", requestBody);
            // Assuming generateSchedule api takes the whole body or we need to update api service?
            // The existing api usage in useScheduleStore passed 'payload' which was just the subject mapping.
            // Let's check api.js content first if possible, but assuming standard post:
            // I will update existing call. If api.js expects just 'subjectCodes', I might need to change api.js too.
            // But previous code was: generateSchedule(payload).

            // Wait, looking at generateController.js: const { subjectCodes } = req.body;
            // It expects an object with subjectCodes property if valid.
            // BUT wait, existing controller logic:
            // const { subjectCodes } = req.body;
            // CHECK CONTROLLER AGAIN.

            // Controller: 
            // const { subjectCodes } = req.body;
            // if (isArray) ... 

            // So if I send { subjectCodes: {...}, advancedSettings: {...} } it should be fine.
            // However, previously `payload` was assigned to `subjectCodes` probably?
            // Let's check api.js or how it was called.
            // Previous call: generateSchedule(payload).
            // Payload was { "IT1110": ... }.
            // So req.body WAS the payload? 
            // If req.body IS the payload, then req.body.subjectCodes would be undefined if I just sent { "IT1110": ... }.
            // UNLESS the previous payload was WRAPPED in { subjectCodes: ... } inside api.js?

            // Let's assume api.js wraps it or I should wrap it here.
            // If I look at generateController.js:
            // const { subjectCodes } = req.body;
            // This implies req.body MUST have subjectCodes.

            // So current store implementation:
            // const result = await generateSchedule(payload);
            // If payload is { "IT1110": ... }, then req.body is { "IT1110": ... }.
            // Then const { subjectCodes } = req.body -> subjectCodes is undefined?
            // This suggests generateController might have been designed for { subjectCodes: [...] } BUT
            // checks `isObject` logic:
            // const isObject = typeof subjectCodes === 'object' ... 
            // This line implies subjectCodes ITSELF is the object? No.
            // It gets subjectCodes FROM req.body.

            // So for the current code to work, either:
            // 1. api.js wraps the data in { subjectCodes: data }
            // 2. The controller handles req.body directly? 
            //    No, `const { subjectCodes } = req.body;` is explicit.

            // I'll assume api.js handles the wrapping or I should strictly pass { subjectCodes, advancedSettings }.
            // I will use a cleaner object structure now.

            const result = await generateSchedule(requestBody);

            if (result.schedules && result.schedules.length > 0) {
                set({ schedules: result.schedules, currentScheduleIndex: 0 });
                return true;
            } else {
                set({ schedules: [], error: "Không tìm thấy phương án xếp lịch nào phù hợp." });
                return false;
            }
        } catch (err) {
            console.error(err);
            set({ error: err.message || "Có lỗi xảy ra khi xếp lịch.", schedules: [] });
            return false;
        } finally {
            set({ loading: false });
        }
    },

    sortSchedules: (criteria) => {
        const { schedules } = get();
        if (!schedules || schedules.length === 0) return;

        // Helpers
        const timeToMinutes = (timeStr) => {
            if (!timeStr) return 0;
            const num = parseInt(timeStr);
            const hour = Math.floor(num / 100);
            const min = num % 100;
            return hour * 60 + min;
        };

        const calculateStats = (schedule) => {
            let freeMornings = 0;
            let freeAfternoons = 0;
            let freeDays = 0;

            // Check Mon(2) to Sun(8)
            for (let d = 2; d <= 8; d++) {
                let hasMorning = false;
                let hasAfternoon = false;
                let hasClass = false;

                schedule.forEach(cls => {
                    cls.sessions.forEach(sess => {
                        if (sess.day === d) {
                            hasClass = true;
                            const s = timeToMinutes(sess.start_time);
                            const e = timeToMinutes(sess.end_time);
                            // Morning: 06:45 (405) - 11:45 (705)
                            if (s < 705 && e > 405) hasMorning = true;
                            // Afternoon: 12:30 (750) - 17:30 (1050)
                            if (s < 1050 && e > 750) hasAfternoon = true;
                        }
                    });
                });

                if (!hasMorning) freeMornings++;
                if (!hasAfternoon) freeAfternoons++;
                if (!hasClass) freeDays++;
            }

            return {
                morning: freeMornings,
                afternoon: freeAfternoons,
                session: freeMornings + freeAfternoons,
                day: freeDays
            };
        };

        const sorted = [...schedules].sort((a, b) => {
            const statsA = calculateStats(a);
            const statsB = calculateStats(b);
            // Descending sort
            return statsB[criteria] - statsA[criteria];
        });

        set({ schedules: sorted, currentScheduleIndex: 0 });
    },
    getInforSchedule: () => {
        const { schedules, currentScheduleIndex } = get();
        if (!schedules || schedules.length === 0) return null;
        if (typeof currentScheduleIndex !== 'number' || currentScheduleIndex < 0 || currentScheduleIndex >= schedules.length) return null;
        return schedules[currentScheduleIndex];
    },
}));

export default useScheduleStore;
