import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseSearch from '../components/features/CourseSearch';
import CourseList from '../components/features/CourseList';
import AdvancedSettingsModal from '../components/features/AdvancedSettingsModal';
import useScheduleStore from '../store/useScheduleStore';
import { Calendar, Loader2, Settings } from 'lucide-react';

export default function SelectionPage() {
    const navigate = useNavigate();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const {
        selectedSubjects,
        selectedClasses,
        addSubject,
        removeSubject,
        updateClassSelection,
        clearSubjects,
        generateSchedules,
        loading,
        error
    } = useScheduleStore();

    const handleGenerateClick = async () => {
        const success = await generateSchedules();
        if (success) {
            navigate('/schedule');
        }
    };

    return (
        <div>
            <div className="flex flex-col lg:flex-row gap-6 h-full p-4 lg:w-fit">
                {/* Search Section */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:w-fit">
                    <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 w-[300px]">
                        <span className="w-1.5 h-6 bg-green-600 rounded-full"></span>
                        Tìm kiếm môn học
                    </h2>
                    <CourseSearch
                        onAddSubject={addSubject}
                        selectedSubjectIds={selectedSubjects.map(s => s.subject_id)}
                    />
                </div>

                <div className="pt-4 mt-2 border-t border-gray-100">
                    <button
                        onClick={handleGenerateClick}
                        disabled={selectedSubjects.length === 0 || loading}
                        className="w-[200px] py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 cursor-pointer"
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

                <div className="pt-4 mt-2 border-t border-gray-100">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-[200px] py-3 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Settings size={20} />
                        Cài đặt nâng cao
                    </button>
                </div>
            </div>
            <div className="flex flex-col gap-6 h-full p-4">
                {/* Selected List Section */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col lg:h-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            Môn đã chọn ({selectedSubjects.length})
                        </h2>
                        {selectedSubjects.length > 0 && (
                            <button
                                onClick={clearSubjects}
                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                                Xóa tất cả
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto pr-1">
                        <CourseList
                            subjects={selectedSubjects}
                            onRemoveSubject={removeSubject}
                            selectedClasses={selectedClasses}
                            onUpdateSelection={updateClassSelection}
                        />
                    </div>
                </div>
            </div>

            <AdvancedSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
