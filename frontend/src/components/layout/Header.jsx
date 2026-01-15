import React, { useState } from 'react';
import { GraduationCap, Upload } from 'lucide-react';
import { uploadFile } from '../../services/api';

export default function Header() {
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            await uploadFile(file);
            alert('Tải lên thành công!');
            // Optional: You might want to refresh data here if needed
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Tải lên thất bại: ' + error.message);
        } finally {
            setIsUploading(false);
            // Reset input value to allow uploading the same file again
            event.target.value = '';
        }
    };
    return (
        <header className="bg-hust-green text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <GraduationCap size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wide">TKB HUST</h1>
                        <p className="text-xs text-green-100 opacity-90 font-medium">Soạn thời khóa biểu</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-colors text-sm font-medium">
                        <Upload size={16} />
                        <span>{isUploading ? 'Đang tải lên...' : 'Import Dữ Liệu'}</span>
                        <input
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                </div>
            </div>
        </header>
    );
}
