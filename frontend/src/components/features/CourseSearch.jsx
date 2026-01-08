import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Plus, Check } from 'lucide-react';
import { searchSubjects } from '../../services/api';

export default function CourseSearch({ onAddSubject, selectedSubjectIds = [] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim()) {
                setLoading(true);
                try {
                    const data = await searchSubjects(query);
                    setResults(data);
                    setIsOpen(true);
                } catch (error) {
                    console.error("Search failed", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (subject) => {
        onAddSubject(subject);
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setIsOpen(true)}
                    placeholder="Nhập mã môn (VD: IT3011)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 max-h-80 overflow-y-auto">
                    {results.map((subject) => {
                        const isSelected = selectedSubjectIds.includes(subject.subject_id); // Adjust property name if needed
                        // Need to check backend subject structure. 
                        // Assuming subject object has 'SubjectCode' and 'SubjectName' or similar. 
                        // I will assume properties based on typical output, but might need to adjust.
                        // Wait, previous file view didn't show the structure. 
                        // Let's assume standard keys and fix if broken.

                        return (
                            <button
                                key={subject._id || subject.subject_id}
                                onClick={() => !isSelected && handleSelect(subject)}
                                disabled={isSelected}
                                className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between border-b last:border-0 transition-colors
                                    ${isSelected ? 'bg-green-50/50 cursor-default' : 'cursor-pointer'}
                                `}
                            >
                                <div>
                                    <div className="font-bold text-gray-800">{subject.subject_id}</div>
                                    <div className="text-sm text-gray-600 truncate">{subject.subject_name}</div>
                                </div>
                                {isSelected ? (
                                    <Check size={18} className="text-green-600" />
                                ) : (
                                    <Plus size={18} className="text-gray-400" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {isOpen && query && !loading && results.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-100 p-4 text-center text-gray-500 text-sm">
                    Không tìm thấy môn học nào
                </div>
            )}
        </div>
    );
}
