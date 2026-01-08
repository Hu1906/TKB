import React, { useState, useEffect } from 'react';
import { Search, Plus, X, Calendar, RefreshCw, ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react';

// API Base URL
const API_BASE = 'http://localhost:3000/api';

// Component tìm kiếm môn học
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

// Component hiển thị môn đã chọn với khả năng chọn lớp
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

// Component hiển thị một phương án TKB
const ScheduleOption = ({ schedule, index, onSelect }) => {
  const dayNames = ['', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg">Phương án {index + 1}</h3>
        <button
          onClick={() => onSelect(schedule)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
        >
          <Calendar size={18} />
          Xem lịch
        </button>
      </div>

      <div className="space-y-2">
        {schedule.map((cls, idx) => (
          <div key={idx} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
            <div className="font-semibold text-blue-600">
              {cls.subject_id} - {cls.class_id}
            </div>
            {cls.sessions.map((session, sIdx) => (
              <div key={sIdx} className="text-sm text-gray-600 mt-1">
                Thứ {dayNames[session.day]} • {session.start_time}-{session.end_time} • {session.room}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Component hiển thị lịch tuần
const WeeklyCalendar = ({ schedule, onClose }) => {
  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 6); // 6h - 19h

  const formatTime = (timeStr) => {
    return `${timeStr.slice(0, 2)}:${timeStr.slice(2)}`;
  };

  const getSessionPosition = (session) => {
    const startHour = parseInt(session.start_time.slice(0, 2));
    const startMin = parseInt(session.start_time.slice(2));
    const endHour = parseInt(session.end_time.slice(0, 2));
    const endMin = parseInt(session.end_time.slice(2));

    const top = ((startHour - 6) * 60 + startMin) / 60 * 60;
    const height = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60 * 60;

    return { top, height };
  };

  const colors = ['bg-blue-100 border-blue-500', 'bg-green-100 border-green-500', 'bg-purple-100 border-purple-500', 
                  'bg-pink-100 border-pink-500', 'bg-yellow-100 border-yellow-500', 'bg-red-100 border-red-500'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Thời Khóa Biểu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-8 gap-2">
            <div className="font-semibold text-center">Giờ</div>
            {[2, 3, 4, 5, 6, 7].map(day => (
              <div key={day} className="font-semibold text-center">
                {dayNames[day - 2]}
              </div>
            ))}

            {hours.map(hour => (
              <React.Fragment key={hour}>
                <div className="text-sm text-gray-600 text-right pr-2 pt-2">
                  {hour}:00
                </div>
                {[2, 3, 4, 5, 6, 7].map(day => (
                  <div key={`${day}-${hour}`} className="border border-gray-200 min-h-[60px] relative">
                    {schedule.map((cls, clsIdx) => 
                      cls.sessions
                        .filter(s => s.day === day)
                        .map((session, sIdx) => {
                          const sessionHour = parseInt(session.start_time.slice(0, 2));
                          if (sessionHour !== hour) return null;

                          const { top, height } = getSessionPosition(session);
                          return (
                            <div
                              key={`${clsIdx}-${sIdx}`}
                              className={`absolute left-0 right-0 mx-1 ${colors[clsIdx % colors.length]} 
                                       border-l-4 rounded p-1 text-xs overflow-hidden shadow-sm`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                            >
                              <div className="font-bold">{cls.subject_id}</div>
                              <div className="text-xs">{formatTime(session.start_time)}-{formatTime(session.end_time)}</div>
                              <div className="text-xs">{session.room}</div>
                            </div>
                          );
                        })
                    )}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component chính
export default function App() {
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectClasses, setSubjectClasses] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingSchedule, setViewingSchedule] = useState(null);
  const [error, setError] = useState('');

  const addSubject = (subject) => {
    if (!selectedSubjects.find(s => s.subject_id === subject.subject_id)) {
      setSelectedSubjects([...selectedSubjects, subject]);
      setSubjectClasses({ ...subjectClasses, [subject.subject_id]: [] });
    }
  };

  const removeSubject = (subjectId) => {
    setSelectedSubjects(selectedSubjects.filter(s => s.subject_id !== subjectId));
    const newClasses = { ...subjectClasses };
    delete newClasses[subjectId];
    setSubjectClasses(newClasses);
  };

  const updateClasses = (subjectId, classes) => {
    setSubjectClasses({ ...subjectClasses, [subjectId]: classes });
  };

  const generateSchedules = async () => {
    if (selectedSubjects.length === 0) {
      setError('Vui lòng chọn ít nhất một môn học');
      return;
    }

    setLoading(true);
    setError('');
    setSchedules([]);

    try {
      const response = await fetch(`${API_BASE}/generate/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectCodes: subjectClasses
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Lỗi khi tạo thời khóa biểu');
        return;
      }

      if (data.schedules.length === 0) {
        setError('Không tìm thấy phương án nào phù hợp. Vui lòng thử chọn lớp khác hoặc bỏ bớt môn.');
      } else {
        setSchedules(data.schedules);
      }
    } catch (error) {
      setError('Lỗi kết nối đến server. Vui lòng kiểm tra backend đang chạy.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📚 Xếp Thời Khóa Biểu Tự Động
          </h1>
          <p className="text-gray-600">Chọn môn học và tìm phương án học tốt nhất cho bạn</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search size={24} />
            Tìm kiếm môn học
          </h2>
          <SubjectSearch onSelectSubject={addSubject} />
        </div>

        {/* Selected Subjects */}
        {selectedSubjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Check size={24} />
                Các môn đã chọn ({selectedSubjects.length})
              </h2>
              <button
                onClick={() => {
                  setSelectedSubjects([]);
                  setSubjectClasses({});
                  setSchedules([]);
                }}
                className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition flex items-center gap-2"
              >
                <Trash2 size={18} />
                Xóa tất cả
              </button>
            </div>

            <div className="grid gap-4">
              {selectedSubjects.map(subject => (
                <SelectedSubjectCard
                  key={subject.subject_id}
                  subject={subject}
                  onRemove={removeSubject}
                  onUpdateClasses={updateClasses}
                />
              ))}
            </div>

            <button
              onClick={generateSchedules}
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg 
                       hover:from-blue-600 hover:to-indigo-700 transition font-bold text-lg shadow-lg
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={24} className="animate-spin" />
                  Đang xếp lịch...
                </>
              ) : (
                <>
                  <Calendar size={24} />
                  Tạo Thời Khóa Biểu
                </>
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        {/* Schedules Result */}
        {schedules.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              🎉 Tìm thấy {schedules.length} phương án
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.slice(0, 50).map((schedule, index) => (
                <ScheduleOption
                  key={index}
                  schedule={schedule}
                  index={index}
                  onSelect={setViewingSchedule}
                />
              ))}
            </div>
            {schedules.length > 50 && (
              <div className="mt-4 text-center text-gray-600">
                Hiển thị 50/{schedules.length} phương án
              </div>
            )}
          </div>
        )}

        {/* Calendar Modal */}
        {viewingSchedule && (
          <WeeklyCalendar
            schedule={viewingSchedule}
            onClose={() => setViewingSchedule(null)}
          />
        )}
      </div>
    </div>
  );
}