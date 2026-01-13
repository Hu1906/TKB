import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import useScheduleStore from '../../store/useScheduleStore';

export default function AdvancedSettingsModal({ isOpen, onClose }) {
    const { advancedSettings, updateAdvancedSettings } = useScheduleStore();

    if (!isOpen) return null;

    const days = [
        { id: 2, label: 'Thứ 2' },
        { id: 3, label: 'Thứ 3' },
        { id: 4, label: 'Thứ 4' },
        { id: 5, label: 'Thứ 5' },
        { id: 6, label: 'Thứ 6' },
        { id: 7, label: 'Thứ 7' },
        { id: 8, label: 'Chủ Nhật' },
    ];

    const toggleSetting = (key) => {
        updateAdvancedSettings(key, !advancedSettings[key]);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800">Cài đặt nâng cao</h3>
                        <p className="text-sm text-gray-500">Tùy chỉnh ràng buộc thời gian</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    <div className="mb-6">
                        <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-orange-500 rounded-full"></span>
                            Thời gian nghỉ (Tránh học)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {days.map(day => (
                                <div key={day.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <div className="font-bold text-gray-800 mb-2 border-b border-gray-200 pb-1">
                                        {day.label}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors select-none">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                                checked={!!advancedSettings[`${day.id}-morning`]}
                                                onChange={() => toggleSetting(`${day.id}-morning`)}
                                            />
                                            <span className="text-sm text-gray-600">Nghỉ Sáng</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors select-none">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                                                checked={!!advancedSettings[`${day.id}-afternoon`]}
                                                onChange={() => toggleSetting(`${day.id}-afternoon`)}
                                            />
                                            <span className="text-sm text-gray-600">Nghỉ Chiều</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-700 border border-blue-100">
                        <div className="shrink-0 font-bold">Lưu ý:</div>
                        <div>
                            Hệ thống sẽ cố gắng tìm thời khóa biểu thỏa mãn tất cả các ràng buộc trên.
                            Nếu không tìm thấy, vui lòng bỏ bớt các ràng buộc và thử lại.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-2 bg-gray-50 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors shadow-sm"
                    >
                        Đóng và Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}
