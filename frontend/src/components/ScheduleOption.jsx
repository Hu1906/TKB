import React from 'react';
import { Calendar } from 'lucide-react';

const ScheduleOption = ({ schedule, index, onSelect }) => {
    const dayNames = ['', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];

    return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Phương án {index + 1}</h3>
                <button
                    onClick={() => onSelect(schedule)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                >
                    <Calendar size={18} />
                    Xem lịch
                </button>
            </div>

            <div className="space-y-2">
                {schedule.map((cls, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
                        <div className="font-semibold text-blue-600">
                            {cls.subject_id} - {cls.class_id}
                        </div>
                        {cls.sessions.map((session, sIdx) => (
                            <div key={sIdx} className="text-sm text-gray-600 mt-1">
                                Thứ {dayNames[session.day]} • {session.start_time}-{session.end_time} • {session.room}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleOption;
