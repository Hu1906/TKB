import React, { useMemo } from 'react';

// Constants for Time Grid
const START_HOUR = 6;
const END_HOUR = 18; // Until 18:00
const SLOT_MINUTES = 30;
const TOTAL_SLOTS = (END_HOUR - START_HOUR) * (60 / SLOT_MINUTES); // (18-6) * 2 = 24 slots

// Helper to convert "HHmm" string to minutes from midnight
const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const h = parseInt(timeStr.slice(0, -2) || 0); // Handle "645" as "6" "45" logic needs padding if length < 4 but usually backend sends "0645" or "1230"
    // Better safely parse:
    const num = parseInt(timeStr);
    const hour = Math.floor(num / 100);
    const min = num % 100;
    return hour * 60 + min;
};

// Map minutes to Grid Row (1-based)
const getGridRow = (minutes) => {
    const startMinutes = START_HOUR * 60;
    const row = Math.floor((minutes - startMinutes) / SLOT_MINUTES) + 1;
    return Math.max(1, row);
};

export default function TimetableGrid({ schedule }) {
    const gridData = useMemo(() => {
        const cells = [];
        if (!schedule) return [];

        schedule.forEach(cls => {
            cls.sessions.forEach(sess => {
                const startMin = timeToMinutes(sess.start_time);
                const endMin = timeToMinutes(sess.end_time);

                const startRow = getGridRow(startMin);

                cells.push({
                    day: sess.day,
                    startMin,
                    endMin,
                    cls,
                    sess
                });
            });
        });
        return cells;
    }, [schedule]);

    const days = [2, 3, 4, 5, 6, 7, 8];
    const timeLabels = Array.from({ length: TOTAL_SLOTS + 1 }, (_, i) => {
        const totalMin = START_HOUR * 60 + i * SLOT_MINUTES;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return `${h}:${m.toString().padStart(2, '0')}`;
    });

    const getCellColor = (type) => {
        const t = type?.toUpperCase();
        if (t === 'LT') return 'bg-blue-100 border-blue-200 text-blue-800 hover:bg-blue-200';
        if (t === 'BT') return 'bg-orange-100 border-orange-200 text-orange-800 hover:bg-orange-200';
        if (t === 'TH' || t === 'TN') return 'bg-red-100 border-red-200 text-red-800 hover:bg-red-200';
        return 'bg-green-100 border-green-200 text-green-800 hover:bg-green-200';
    };

    // Total minutes in view
    const TOTAL_VIEW_MINS = (END_HOUR - START_HOUR) * 60;

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="min-w-[800px] relative">
                {/* Header */}
                <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 text-sm font-bold text-gray-700 sticky top-0 z-10">
                    <div className="p-3 text-center border-r">Giờ</div>
                    {days.map(d => (
                        <div key={d} className="p-3 text-center border-r last:border-0">
                            {d === 8 ? 'CN' : `Thứ ${d}`}
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="flex relative" style={{ height: '900px' }}> {/* Fixed height for calculation */}

                    {/* Time Constants Column */}
                    <div className="w-[12.5%] border-r border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium relative opacity-80 select-none">
                        {timeLabels.map((label, i) => {
                            // Don't show last label to avoid overflow or overlap
                            if (i === timeLabels.length - 1 && i % 2 !== 0) return null;

                            return (
                                <div
                                    key={i}
                                    className="absolute w-full text-right pr-2 -translate-y-1/2 border-t border-transparent" // Center label on the tick
                                    style={{ top: `${(i * SLOT_MINUTES / TOTAL_VIEW_MINS) * 100}%` }}
                                >
                                    {i % 2 === 0 && label} {/* Show only hourly labels for cleanliness, or halves too? */}
                                </div>
                            )
                        })}
                    </div>

                    {/* Day Columns */}
                    {days.map((day, dayIdx) => (
                        <div key={day} className="w-[12.5%] border-r border-gray-100 last:border-0 relative">
                            {/* Horizontal Grid lines */}
                            {timeLabels.map((_, i) => (
                                <div
                                    key={i}
                                    className={`absolute w-full border-t ${i % 2 === 0 ? 'border-gray-200' : 'border-gray-50'}`}
                                    style={{ top: `${(i * SLOT_MINUTES / TOTAL_VIEW_MINS) * 100}%` }}
                                />
                            ))}

                            {/* Classes for this day */}
                            {gridData.filter(item => item.day === day).map((item, idx) => {
                                // Calculate Top and Height percentages
                                const startMinsFromBase = item.startMin - (START_HOUR * 60);
                                const duration = item.endMin - item.startMin;

                                const topPct = (startMinsFromBase / TOTAL_VIEW_MINS) * 100;
                                const heightPct = (duration / TOTAL_VIEW_MINS) * 100;

                                return (
                                    <div
                                        key={idx}
                                        className={`absolute left-1 right-1 rounded border shadow-sm p-1.5 flex flex-col justify-start overflow-hidden text-[10px] leading-tight cursor-pointer transition-all z-10 hover:z-50 hover:shadow-md ${getCellColor(item.cls.class_type)}`}
                                        style={{
                                            top: `${topPct}%`,
                                            height: `${heightPct}%`,
                                        }}
                                        title={`${item.cls.class_id} (${item.cls.class_type})\n${item.cls.subject_id}\n${item.sess.start_time} - ${item.sess.end_time}\nPhòng: ${item.sess.room}\nNote: ${item.cls.note || ''}`}
                                    >
                                        <div className="font-bold flex justify-between">
                                            <span>{item.sess.start_time}-{item.sess.end_time}</span>
                                            <span className="opacity-75 uppercase">{item.cls.class_type}</span>
                                        </div>
                                        <div className="font-bold truncate" title={item.cls.class_id}>{item.cls.class_id}</div>
                                        <div className="truncate font-medium">{item.cls.subject_id}</div>
                                        <div className="truncate font-medium">{item.sess.room}</div>
                                        {item.cls.note && (
                                            <div className="italic opacity-75 border-t border-black/10 mt-0.5 pt-0.5 whitespace-normal break-words flex-1 overflow-auto min-h-0 text-[11px] leading-tight">
                                                {item.cls.note}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
