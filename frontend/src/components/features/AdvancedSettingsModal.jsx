import React from 'react';
import { X } from 'lucide-react';

export default function AdvancedSettingsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg text-gray-800">Cài đặt nâng cao</h3>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    <p className="text-gray-600 text-sm">
                        Các tùy chọn cài đặt nâng cao sẽ được cập nhật trong phiên bản tiếp theo.
                    </p>

                    {/* Placeholder for future specific settings */}
                    <div className="space-y-3 opacity-50 pointer-events-none">
                        <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 text-green-600 rounded border-gray-300" checked={false} readOnly />
                            <span className="text-sm font-medium text-gray-700">Tránh học buổi sáng</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 text-green-600 rounded border-gray-300" checked={false} readOnly />
                            <span className="text-sm font-medium text-gray-700">Tránh học buổi chiều</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="checkbox" className="w-4 h-4 text-green-600 rounded border-gray-300" checked={false} readOnly />
                            <span className="text-sm font-medium text-gray-700">Ưu tiên lớp ít người</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
