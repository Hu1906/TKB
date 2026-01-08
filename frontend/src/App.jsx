import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import CourseSearch from './components/features/CourseSearch';
import CourseList from './components/features/CourseList';
import TimetableGrid from './components/features/TimetableGrid';
import { generateSchedule, uploadFile } from './services/api';
import { Upload, Calendar, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export default function App() {
    const [selectedSubjects, setSelectedSubjects] = useState([]); // Array of full subject objects
    const [schedules, setSchedules] = useState([]);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAddSubject = (subject) => {
        if (!selectedSubjects.find(s => s.subject_id === subject.subject_id)) {
            setSelectedSubjects([...selectedSubjects, subject]);
        }
    };

    const handleRemoveSubject = (code) => {
        setSelectedSubjects(selectedSubjects.filter(s => s.subject_id !== code));
    };

    const handleGenerate = async () => {
        if (selectedSubjects.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            // Backend expects array of codes ["IT1110", "MI1111"]
            const codes = selectedSubjects.map(s => s.subject_id);
            const result = await generateSchedule(codes);
            if (result.schedules && result.schedules.length > 0) {
                setSchedules(result.schedules);
                setCurrentScheduleIndex(0);
            } else {
                setSchedules([]);
                setError("Không tìm thấy phương án xếp lịch nào phù hợp.");
            }
        } catch (err) {
            console.error(err);
            setError(err.message || "Có lỗi xảy ra khi xếp lịch.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row gap-6 h-full">
                {/* Sidebar */}
                <aside className="w-full lg:w-96 shrink-0 space-y-6">
                    {/* Search & Add */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                            Thêm môn học
                        </h2>
                        <CourseSearch
                            onAddSubject={handleAddSubject}
                            selectedSubjectIds={selectedSubjects.map(s => s.subject_id)}
                        />
                    </div>

                    {/* Selected List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Đã chọn ({selectedSubjects.length})
                            </h2>
                            {selectedSubjects.length > 0 && (
                                <button
                                    onClick={() => setSelectedSubjects([])}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                    Xóa tất cả
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1">
                            <CourseList
                                subjects={selectedSubjects}
                                onRemoveSubject={handleRemoveSubject}
                            />
                        </div>

                        <div className="pt-4 mt-2 border-t border-gray-100">
                            <button
                                onClick={handleGenerate}
                                disabled={selectedSubjects.length === 0 || loading}
                                className="w-full py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Đang xếp...
                                    </>
                                ) : (
                                    <>
                                        <Calendar size={20} />
                                        Xếp Thời Khóa Biểu
                                    </>
                                )}
                            </button>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content: Timetable */}
                <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="text-green-600" />
                            Kết quả xếp lịch
                            {schedules.length > 0 && (
                                <span className="bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded-full font-normal">
                                    {schedules.length} phương án
                                </span>
                            )}
                        </h2>

                        {schedules.length > 0 && (
                            <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
                                <button
                                    onClick={() => setCurrentScheduleIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentScheduleIndex === 0}
                                    className="p-2 hover:bg-white hover:shadow rounded-md transition disabled:opacity-30"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                                <span className="text-sm font-medium w-20 text-center">
                                    {currentScheduleIndex + 1} / {schedules.length}
                                </span>
                                <button
                                    onClick={() => setCurrentScheduleIndex(prev => Math.min(schedules.length - 1, prev + 1))}
                                    disabled={currentScheduleIndex === schedules.length - 1}
                                    className="p-2 hover:bg-white hover:shadow rounded-md transition disabled:opacity-30"
                                >
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto">
                        {schedules.length > 0 ? (
                            <TimetableGrid schedule={schedules[currentScheduleIndex]} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <Calendar size={80} strokeWidth={1} className="mb-4 text-gray-200" />
                                <p className="text-lg font-medium text-gray-400">Chưa có dữ liệu</p>
                                <p className="text-sm text-gray-400">Vui lòng chọn môn và bấm xếp lịch</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
