import React from 'react';
import { X, Calendar, MapPin, Clock } from 'lucide-react';

export default function ClassInfoModal({ isOpen, onClose, schedule }) {
    if (!isOpen) return null;

    // Helper to format session time
    const formatSession = (session) => {
        return (
            <div key={`${session.day}-${session.start_time}`} className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <span className="font-medium text-gray-700 w-12">Thứ {session.day === 8 ? 'CN' : session.day}</span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                    <Clock size={12} />
                    {session.start_time} - {session.end_time}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-600">
                    <MapPin size={12} />
                    {session.room}
                </span>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200 border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">Chi tiết lịch học</h3>
                            <p className="text-xs text-gray-500">{schedule?.length || 0} lớp học phần</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar">
                    {!schedule || schedule.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Không có thông tin lớp học</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {schedule.map((cls, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white group"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors">
                                            {cls.subject_id}
                                        </h4>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${cls.class_type === 'LT' ? 'bg-blue-100 text-blue-700' :
                                                cls.class_type === 'BT' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {cls.class_type}
                                        </span>
                                    </div>

                                    <div className="space-y-1 mb-3">
                                        <p className="text-sm text-gray-600">
                                            <span className="text-gray-400 text-xs uppercase font-medium tracking-wider">Mã lớp:</span>
                                            <span className="ml-2 font-medium">{cls.class_id}</span>
                                        </p>
                                        {cls.note && (
                                            <p className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded border border-gray-100">
                                                "{cls.note}"
                                            </p>
                                        )}
                                    </div>

                                    <div className="border-t border-gray-100 pt-2">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Lịch học</p>
                                        {cls.sessions.map(sess => formatSession(sess))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Đóng
                    </button>
                    {/* Placeholder for future actions like Export/Print */}
                </div>
            </div>
        </div>
    );
}
