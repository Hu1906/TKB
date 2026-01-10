import React, { useState, useEffect } from 'react';
import { Trash2, BookOpen, ChevronDown, ChevronRight, CheckSquare, Square, Loader2 } from 'lucide-react';
import { getSubjectClasses } from '../../services/api';

const CourseItem = ({ subject, onRemove, selectedClassIds, onUpdateSelection }) => {
    const [expanded, setExpanded] = useState(false);
    const [classes, setClasses] = useState(null);
    const [loading, setLoading] = useState(false);

    const toggleExpand = async () => {
        if (!expanded && !classes) {
            setLoading(true);
            try {
                const data = await getSubjectClasses(subject.subject_id);
                setClasses(data);
            } catch (error) {
                console.error("Failed to fetch classes", error);
            } finally {
                setLoading(false);
            }
        }
        setExpanded(!expanded);
    };

    const handleToggleClass = (classId) => {
        // If selectedClassIds is null/undefined, it means ALL are selected.
        // So pressing one means we deselect it?
        // Wait, logical mapping:
        // App state: { subjectId: [classIds] } or null.
        // If null => All.

        let newSelection;
        if (!selectedClassIds) {
            // "All" is selected. User clicked one to UNCHECK it? Or check it?
            // Usually valid usage: User sees "All Checked". Clicks one to uncheck.
            // So we need to switch from "All" to "All except one".
            if (!classes) return; // Should be loaded if we are clicking
            const allIds = classes.map(c => c.class_id);
            newSelection = allIds.filter(id => id !== classId);
        } else {
            // Currently specific list.
            if (selectedClassIds.includes(classId)) {
                newSelection = selectedClassIds.filter(id => id !== classId);
            } else {
                newSelection = [...selectedClassIds, classId];
            }
        }

        // Optimization: If newSelection length == classes.length, revert to null (All)
        if (classes && newSelection.length === classes.length) {
            newSelection = null;
        }

        onUpdateSelection(subject.subject_id, newSelection);
    };

    const isClassSelected = (classId) => {
        if (!selectedClassIds) return true; // Default all
        return selectedClassIds.includes(classId);
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm group hover:border-green-200 transition-all overflow-hidden">
            {/* Header */}
            <div className="p-3 flex items-start gap-3">
                <button
                    onClick={toggleExpand}
                    className="mt-1 text-gray-400 hover:text-green-600 transition-colors"
                >
                    {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={toggleExpand}>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-sm">
                            {subject.subject_id}
                        </span>
                        <span className="text-xs text-gray-500 font-medium border border-gray-200 px-1.5 rounded">
                            {subject.credits}
                        </span>
                        {selectedClassIds && classes && (
                            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-1.5 rounded">
                                Chọn {selectedClassIds.length}/{classes.length} lớp
                            </span>
                        )}
                    </div>
                    <h3 className="text-sm text-gray-700 font-medium leading-snug line-clamp-2" title={subject.subject_name}>
                        {subject.subject_name}
                    </h3>
                </div>

                <button
                    onClick={() => onRemove(subject.subject_id)}
                    className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                    title="Xóa môn học"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Classes List */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-2 text-sm">
                    {loading ? (
                        <div className="flex items-center justify-center py-4 text-gray-500 gap-2">
                            <Loader2 className="animate-spin" size={16} /> Đang tải lớp...
                        </div>
                    ) : classes ? (
                        <div className="space-y-1 max-h-60 overflow-y-auto pl-7">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                                <span className="text-xs font-bold text-gray-500 uppercase">Danh sách lớp ({classes.length})</span>
                                <button
                                    className="text-xs text-blue-600 hover:underline"
                                    onClick={() => onUpdateSelection(subject.subject_id, null)} // Reset to all
                                >
                                    Chọn tất cả
                                    </button>
                                <button
                                    className="text-xs text-blue-600 hover:underline"
                                    onClick={() => onUpdateSelection(subject.subject_id, [])} // Reject all
                                >
                                    Xóa tất cả
                                </button>
                            </div>
                            {classes.map(cls => {
                                const isSelected = isClassSelected(cls.class_id);
                                return (
                                    <div
                                        key={cls.class_id}
                                        className={`flex flex-col gap-1 p-2 rounded cursor-pointer border ${isSelected ? 'border-green-200 bg-green-50/50' : 'border-transparent hover:bg-gray-100 opacity-80'}`}
                                        onClick={() => handleToggleClass(cls.class_id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className={isSelected ? "text-green-600" : "text-gray-400"}>
                                                {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </span>
                                            <span className="font-mono font-bold text-gray-800">{cls.class_id}</span>
                                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ml-auto ${cls.class_type === 'LT' ? 'bg-blue-100 text-blue-700' :
                                                    cls.class_type === 'BT' ? 'bg-orange-100 text-orange-700' : cls.class_type === 'TN' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {cls.class_type}
                                            </span>
                                        </div>
                                        <div className="pl-6 text-xs text-gray-500 space-y-0.5">
                                            <div className="flex gap-2">
                                                <span className="font-medium">Mã HP:</span> {cls.subject_id}
                                            </div>
                                            {cls.note && (
                                                <div className="flex gap-2 text-gray-400 italic">
                                                    <span className="font-medium">Ghi chú:</span> {cls.note}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-2 text-center text-red-500">
                            Không tải được dữ liệu lớp.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function CourseList({ subjects, onRemoveSubject, selectedClasses, onUpdateSelection }) {
    if (subjects.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <BookOpen className="mx-auto text-gray-300 mb-2" size={32} />
                <p className="text-gray-500 text-sm">Chưa có môn học nào được chọn</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {subjects.map((subject) => (
                <CourseItem
                    key={subject.subject_id}
                    subject={subject}
                    onRemove={onRemoveSubject}
                    selectedClassIds={selectedClasses[subject.subject_id]}
                    onUpdateSelection={onUpdateSelection}
                />
            ))}
        </div>
    );
}
