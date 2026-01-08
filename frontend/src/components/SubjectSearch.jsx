import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { API_BASE } from '../services/api';

const SubjectSearch = ({ onSelectSubject }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const searchSubjects = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`${API_BASE}/subjects/search?q=${query}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Lỗi tìm kiếm:', error);
            }
            setLoading(false);
        };

        const timeoutId = setTimeout(searchSubjects, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    return (
        <div className="relative">
            <div className="flex items-center border-2 border-blue-300 rounded-lg overflow-hidden bg-white shadow-sm">
                <Search className="ml-3 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm môn học theo mã hoặc tên..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full p-3 outline-none"
                />
            </div>

            {results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
                    {results.map((subject) => (
                        <div
                            key={subject.subject_id}
                            onClick={() => {
                                onSelectSubject(subject);
                                setQuery('');
                                setResults([]);
                            }}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                        >
                            <div className="font-semibold text-blue-600">{subject.subject_id}</div>
                            <div className="text-sm text-gray-700">{subject.subject_name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                                {subject.credits} tín chỉ • {subject.school}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubjectSearch;
