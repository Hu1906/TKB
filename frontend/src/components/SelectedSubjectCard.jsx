import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { API_BASE } from '../services/api';

const SelectedSubjectCard = ({ subject, onRemove, onUpdateClasses }) => {
    const [expanded, setExpanded] = useState(false);
    const [classes, setClasses] = useState([]);
    const [selectedClasses, setSelectedClasses] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadClasses = async () => {
        if (classes.length > 0) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/subjects/${subject.subject_id}/classes`);
            const data = await response.json();
            setClasses(data);
        } catch (error) {
            console.error('Lỗi tải lớp học:', error);
        }
        setLoading(false);
    };

    const toggleClass = (classId) => {
        const newSelected = selectedClasses.includes(classId)
            ? selectedClasses.filter(id => id !== classId)
            : [...selectedClasses, classId];

        setSelectedClasses(newSelected);
        onUpdateClasses(subject.subject_id, newSelected);
    };

    return (
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-blue-600">{subject.subject_id}</span>
                        {selectedClasses.length > 0 && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                {selectedClasses.length} lớp đã chọn
                            </span>
                        )}
                    </div>
                    <div className="text-gray-700 mt-1">{subject.subject_name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                        {subject.credits} tín chỉ • {subject.school}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setExpanded(!expanded);
                            if (!expanded) loadClasses();
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    <button
                        onClick={() => onRemove(subject.subject_id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="mt-4 pt-4 border-t">
                    {loading ? (
                        <div className="text-center py-4 text-gray-500">Đang tải danh sách lớp...</div>
                    ) : classes.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">Không có lớp nào</div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-sm font-semibold text-gray-600 mb-2">
                                Chọn lớp cụ thể (để trống = tự động):
                            </div>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {classes.map((cls) => (
                                    <label
                                        key={cls.class_id}
                                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedClasses.includes(cls.class_id)}
                                            onChange={() => toggleClass(cls.class_id)}
                                            className="mt-1 w-4 h-4"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium">{cls.class_id}</div>
                                            <div className="text-xs text-gray-600">
                                                {cls.sessions.map((s, i) => (
                                                    <span key={i}>
                                                        Thứ {s.day} • {s.start_time}-{s.end_time} • {s.room}
                                                        {i < cls.sessions.length - 1 && ' | '}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SelectedSubjectCard;
