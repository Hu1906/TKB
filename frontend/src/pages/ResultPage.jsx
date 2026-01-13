import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TimetableGrid from '../components/features/TimetableGrid';
import ClassInfoModal from '../components/features/ClassInfoModal';
import useScheduleStore from '../store/useScheduleStore';
import { Calendar, ArrowLeft, ArrowRight, ArrowLeftCircle } from 'lucide-react';

export default function ResultPage() {
    const navigate = useNavigate();
    const {
        schedules,
        currentScheduleIndex,
        setCurrentScheduleIndex,
        sortSchedules
    } = useScheduleStore();
    const [isClassInfoModalOpen, setIsClassInfoModalOpen] = useState(false);

    // If no schedules (e.g. refresh), redirect or show message
    // Better to show message so user understands what happened
    if (!schedules || schedules.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <Calendar size={80} strokeWidth={1} className="mb-4 text-gray-200" />
                <p className="text-lg font-medium text-gray-400">Chưa có kết quả xếp lịch</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Quay lại chọn môn
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-500 hover:text-gray-700 transition"
                        title="Quay lại"
                    >
                        <ArrowLeftCircle size={28} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="text-green-600" />
                        Kết quả xếp lịch
                        <span className="bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded-full font-normal">
                            {schedules.length} phương án
                        </span>
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsClassInfoModalOpen(true)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm shadow-sm"
                        title="Thông tin lớp"
                    >
                        Thông tin lớp
                    </button>

                    <select
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer shadow-sm"
                        onChange={(e) => sortSchedules(e.target.value)}
                        defaultValue=""
                    >
                        <option value="" disabled>Sắp xếp kết quả...</option>
                        <option value="morning">Nghỉ nhiều buổi sáng nhất</option>
                        <option value="afternoon">Nghỉ nhiều buổi chiều nhất</option>
                        <option value="session">Nghỉ nhiều buổi nhất</option>
                        <option value="day">Nghỉ nhiều ngày nhất</option>
                    </select>

                    <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
                        <button
                            onClick={() => setCurrentScheduleIndex(Math.max(0, currentScheduleIndex - 1))}
                            disabled={currentScheduleIndex === 0}
                            className="p-2 hover:bg-white hover:shadow rounded-md transition disabled:opacity-30 cursor-pointer"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <span className="text-sm font-medium w-20 text-center">
                            {currentScheduleIndex + 1} / {schedules.length}
                        </span>
                        <button
                            onClick={() => setCurrentScheduleIndex(Math.min(schedules.length - 1, currentScheduleIndex + 1))}
                            disabled={currentScheduleIndex === schedules.length - 1}
                            className="p-2 hover:bg-white hover:shadow rounded-md transition disabled:opacity-30 cursor-pointer"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <TimetableGrid schedule={schedules[currentScheduleIndex]} />
            </div>

            <ClassInfoModal
                isOpen={isClassInfoModalOpen}
                onClose={() => setIsClassInfoModalOpen(false)}
                schedule={schedules[currentScheduleIndex]}
            />
        </div>
    );
}
