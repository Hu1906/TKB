import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-hust-green text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-full">
                        <GraduationCap size={28} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase tracking-wide">TKB HUST</h1>
                        <p className="text-xs text-green-100 opacity-90 font-medium">Soạn thời khóa biểu siêu cấp vip pro</p>
                    </div>
                </div>

                <div className="text-sm font-medium opacity-90 hidden sm:block">
                    Học kỳ 2025.2
                </div>
            </div>
        </header>
    );
}
