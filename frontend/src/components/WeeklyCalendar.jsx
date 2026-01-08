import React from 'react';
import { X } from 'lucide-react';

const WeeklyCalendar = ({ schedule, onClose }) => {
    const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6h - 19h

    const formatTime = (timeStr) => {
        return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
    };

    const getSessionPosition = (session) => {
        const startHour = parseInt(session.start_time.slice(0, 2));
        const startMin = parseInt(session.start_time.slice(2));
        const endHour = parseInt(session.end_time.slice(0, 2));
        const endMin = parseInt(session.end_time.slice(2));

        const top = ((startHour - 6) * 60 + startMin) / 60 * 60;
        const height = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60 * 60;

        return { top, height };
    };

    const colors = ['bg-blue-100 border-blue-500', 'bg-green-100 border-green-500', 'bg-purple-100 border-purple-500',
        'bg-pink-100 border-pink-500', 'bg-yellow-100 border-yellow-500', 'bg-red-100 border-red-500'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Thời Khóa Biểu</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-8 gap-2">
                        <div className="font-semibold text-center">Giờ</div>
                        {[2, 3, 4, 5, 6, 7].map(day => (
                            <div key={day} className="font-semibold text-center">
                                {dayNames[day - 2]}
                            </div>
                        ))}

                        {hours.map(hour => (
                            <React.Fragment key={hour}>
                                <div className="text-sm text-gray-600 text-right pr-2 pt-2">
                                    {hour}:00
                                </div>
                                {[2, 3, 4, 5, 6, 7].map(day => (
                                    <div key={`${day}-${hour}`} className="border border-gray-200 min-h-[60px] relative">
                                        {schedule.map((cls, clsIdx) =>
                                            cls.sessions
                                                .filter(s => s.day === day)
                                                .map((session, sIdx) => {
                                                    const sessionHour = parseInt(session.start_time.slice(0, 2));
                                                    if (sessionHour !== hour) return null;

                                                    const { top, height } = getSessionPosition(session);
                                                    return (
                                                        <div
                                                            key={`${clsIdx}-${sIdx}`}
                                                            className={`absolute left-0 right-0 mx-1 ${colors[clsIdx % colors.length]} 
                                       border-l-4 rounded p-1 text-xs overflow-hidden shadow-sm`}
                                                            style={{ top: `${top}px`, height: `${height}px` }}
                                                        >
                                                            <div className="font-bold">{cls.subject_id}</div>
                                                            <div className="text-xs">{formatTime(session.start_time)}-{formatTime(session.end_time)}</div>
                                                            <div className="text-xs">{session.room}</div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeeklyCalendar;
