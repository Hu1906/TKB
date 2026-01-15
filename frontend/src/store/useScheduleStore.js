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
