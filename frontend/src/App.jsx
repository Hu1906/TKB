import React, { useState } from 'react';
import { Search, Check, Trash2, RefreshCw, Calendar } from 'lucide-react';
import SubjectSearch from './components/SubjectSearch';
import SelectedSubjectCard from './components/SelectedSubjectCard';
import ScheduleOption from './components/ScheduleOption';
import WeeklyCalendar from './components/WeeklyCalendar';
import { API_BASE } from './services/api';

export default function App() {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjectClasses, setSubjectClasses] = useState({});
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewingSchedule, setViewingSchedule] = useState(null);
    const [error, setError] = useState('');

    const addSubject = (subject) => {
        if (!selectedSubjects.find(s => s.subject_id === subject.subject_id)) {
            setSelectedSubjects([...selectedSubjects, subject]);
            setSubjectClasses({ ...subjectClasses, [subject.subject_id]: [] });
        }
    };

    const removeSubject = (subjectId) => {
        setSelectedSubjects(selectedSubjects.filter(s => s.subject_id !== subjectId));
        const newClasses = { ...subjectClasses };
        delete newClasses[subjectId];
        setSubjectClasses(newClasses);
    };

    const updateClasses = (subjectId, classes) => {
        setSubjectClasses({ ...subjectClasses, [subjectId]: classes });
    };

    const generateSchedules = async () => {
        if (selectedSubjects.length === 0) {
            setError('Vui lòng chọn ít nhất một môn học');
            return;
        }

        setLoading(true);
        setError('');
        setSchedules([]);

        try {
            const response = await fetch(`${API_BASE}/generate/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subjectCodes: subjectClasses
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Lỗi khi tạo thời khóa biểu');
                return;
            }

            if (data.schedules.length === 0) {
                setError('Không tìm thấy phương án nào phù hợp. Vui lòng thử chọn lớp khác hoặc bỏ bớt môn.');
            } else {
                setSchedules(data.schedules);
            }
        } catch (error) {
            setError('Lỗi kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        Xếp Thời Khóa Biểu
                    </h1>
                </div>

                {/* Search Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Search size={24} />
                        Tìm kiếm môn học
                    </h2>
                    <SubjectSearch onSelectSubject={addSubject} />
                </div>

                {/* Selected Subjects */}
                {selectedSubjects.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Check size={24} />
                                Các môn đã chọn ({selectedSubjects.length})
                            </h2>
                            <button
                                onClick={() => {
                                    setSelectedSubjects([]);
                                    setSubjectClasses({});
                                    setSchedules([]);
                                }}
                                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Xóa tất cả
                            </button>
                        </div>

                        <div className="grid gap-4">
                            {selectedSubjects.map(subject => (
                                <SelectedSubjectCard
                                    key={subject.subject_id}
                                    subject={subject}
                                    onRemove={removeSubject}
                                    onUpdateClasses={updateClasses}
                                />
                            ))}
                        </div>

                        <button
                            onClick={generateSchedules}
                            disabled={loading}
                            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg 
                       hover:from-blue-600 hover:to-indigo-700 transition font-bold text-lg shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw size={24} className="animate-spin" />
                                    Đang xếp lịch...
                                </>
                            ) : (
                                <>
                                    <Calendar size={24} />
                                    Tạo Thời Khóa Biểu
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 text-red-700">
                        {error}
                    </div>
                )}

                {/* Schedules Result */}
                {schedules.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-4">
                            Tìm thấy {schedules.length} phương án
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {schedules.slice(0, 50).map((schedule, index) => (
                                <ScheduleOption
                                    key={index}
                                    schedule={schedule}
                                    index={index}
                                    onSelect={setViewingSchedule}
                                />
                            ))}
                        </div>
                        {schedules.length > 50 && (
                            <div className="mt-4 text-center text-gray-600">
                                Hiển thị 50/{schedules.length} phương án
                            </div>
                        )}
                    </div>
                )}

                {/* Calendar Modal */}
                {viewingSchedule && (
                    <WeeklyCalendar
                        schedule={viewingSchedule}
                        onClose={() => setViewingSchedule(null)}
                    />
                )}
            </div>
        </div>
    );
}
