import React from 'react';
import { Trash2, BookOpen, AlertCircle } from 'lucide-react';

export default function CourseList({ subjects, onRemoveSubject }) {
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
                <div
                    key={subject.subject_id}
                    className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-3 shadow-sm group hover:border-green-200 transition-colors"
                >
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded text-sm">
                                {subject.subject_id}
                            </span>
                            <span className="text-xs text-gray-500 font-medium border border-gray-200 px-1.5 rounded">
                                {subject.credits} TC
                            </span>
                        </div>
                        <h3 className="text-sm text-gray-700 font-medium leading-snug line-clamp-2" title={subject.subject_name}>
                            {subject.subject_name}
                        </h3>
                    </div>

                    <button
                        onClick={() => onRemoveSubject(subject.subject_id)}
                        className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa môn học"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}
