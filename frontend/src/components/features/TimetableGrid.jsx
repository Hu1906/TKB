import React, { useMemo } from 'react';

// Maps start time string "HHmm" to Period number (1-12)
const parsePeriod = (timeStr) => {
    if (!timeStr) return 0;
    const t = parseInt(timeStr);
    // Morning
    if (t <= 645) return 1;
    if (t <= 730) return 2;
    if (t <= 825) return 3;
    if (t <= 920) return 4;
    if (t <= 1015) return 5;
    if (t <= 1100) return 6;
    // Afternoon
    if (t <= 1230) return 7;
    if (t <= 1315) return 8;
    if (t <= 1410) return 9;
    if (t <= 1505) return 10;
    if (t <= 1600) return 11;
    if (t <= 1645) return 12;
    return 1; // Default
};

const getPeriodCount = (startStr, endStr) => {
    // Basic approximation: subtract times or periods
    // Since we don't have exact end times mapping to period ends in the same way, 
    // let's use the property that periods are roughly 45-50 mins.
    // However, easier way: 
    // Start Period = parsePeriod(startStr)
    // End Period = parsePeriod(endStr) - 1? No, endStr is when it ends.
    // If endStr is 0730, it ended at the end of Period 1? No, 7:30 is start of Period 2.
    // Usually end_time provided by HUST data is the END of the session.

    // Let's refine based on typical durations.
    // If start 0645 end 0815 => Period 1 & 2.
    // parse(0645) = 1. parse(0815) = 2 (start of 2).
    // Actually, let's look at the data if possible. But better logic:
    // Map End Times specifically.
    // 0730 -> End of P1
    // 0815 -> End of P2
    // 0910 -> End of P3
    // 1005 -> End of P4
    // 1100 -> End of P5
    // 1145 -> End of P6
    // ...

    // Let's rely on calculating Start Period and "Duration".
    // Or just render absolute positions if we want. But Grid is easier with rows 1-12.

    const s = parsePeriod(startStr);
    // We need an "End Period" mapper.
    const getEndPeriod = (tStr) => {
        const t = parseInt(tStr);
        if (t <= 730) return 1;
        if (t <= 825) return 2; // 8:15 is end of P2
        if (t <= 920) return 3; // 9:10
        if (t <= 1015) return 4; // 10:05
        if (t <= 1100) return 5;
        if (t <= 1200) return 6; // 11:45

        if (t <= 1315) return 7; // 13:15 is start of P8? No. 12:30-13:15
        if (t <= 1410) return 8;
        if (t <= 1505) return 9;
        if (t <= 1600) return 10;
        if (t <= 1645) return 11;
        return 12;
    };

    const e = getEndPeriod(endStr);
    return Math.max(1, e - s + 1);
};


export default function TimetableGrid({ schedule }) {
    // Schedule is an array of Class objects, each has 'sessions'.

    const gridData = useMemo(() => {
        const cells = []; // { day, startPeriod, duration, classData }
        if (!schedule) return [];

        schedule.forEach(cls => {
            cls.sessions.forEach(sess => {
                const startPeriod = parsePeriod(sess.start_time);
                const duration = getPeriodCount(sess.start_time, sess.end_time);
                cells.push({
                    day: sess.day, // 2-8
                    startPeriod,
                    duration,
                    cls,
                    sess
                });
            });
        });
        return cells;
    }, [schedule]);

    const days = [2, 3, 4, 5, 6, 7, 8]; // 8 is Sunday usually in VN convention, or we map CN.
    // HUST data: day 2 = Mon, ... 7 = Sat, 8 = Sun? Or 1? Usually 2-8.

    const periods = Array.from({ length: 12 }, (_, i) => i + 1);

    const getCellColor = (type) => {
        const t = type?.toUpperCase();
        if (t === 'LT') return 'bg-blue-100 border-blue-200 text-blue-800';
        if (t === 'BT') return 'bg-orange-100 border-orange-200 text-orange-800';
        if (t === 'TH' || t === 'TN') return 'bg-red-100 border-red-200 text-red-800';
        return 'bg-green-100 border-green-200 text-green-800';
    };

    return (
        <div className="overflow-x-auto">
            <div className="min-w-[800px] border border-gray-200 rounded-lg overflow-hidden bg-white">
                {/* Header Row */}
                <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200 text-center font-bold text-gray-700 text-sm">
                    <div className="p-3 border-r">Tiết / Thứ</div>
                    {days.map(d => (
                        <div key={d} className="p-3 border-r last:border-0">
                            {d === 8 ? 'CN' : `Thứ ${d}`}
                        </div>
                    ))}
                </div>

                {/* Grid Rows */}
                <div className="relative grid grid-cols-8 grid-rows-[repeat(12,minmax(50px,auto))]">
                    {/* Time Column */}
                    {periods.map(p => (
                        <div key={p} className="row-span-1 border-r border-b last:border-b-0 border-gray-100 p-2 text-center text-xs font-medium text-gray-500 bg-gray-50 flex items-center justify-center">
                            Tiết {p}
                        </div>
                    ))}

                    {/* Empty Cells Background (for visual structure) - Optional, 
                        but effectively we are placing absolute or using row-start/row-span 
                    */}

                    {/* 
                       Better approach with Grid:
                       We are inside a Grid Container.
                       Columns: 8 (1 for label, 7 for days).
                       Rows: 12.
                    */}

                    {/* Place items */}
                    {gridData.map((item, idx) => {
                        // Grid Column: Day - 1 (since 2->Col 2, 3->Col 3...) + 1 offset?
                        // Days are 2,3,4,5,6,7,8.
                        // Grid Cols 1 (Label), 2(Mon/2), 3(Tue/3)... 8(Sun/8).
                        const colStart = item.day; // Direct mapping if we start days from 2 at col 2.
                        // But verifying: col 1 is Label. So Day 2 needs to be at Col 2.

                        return (
                            <div
                                key={idx}
                                style={{
                                    gridColumn: `${colStart} / span 1`,
                                    gridRow: `${item.startPeriod} / span ${item.duration}`,
                                }}
                                className={`m-1 p-2 rounded text-xs border shadow-sm flex flex-col justify-between overflow-hidden cursor-pointer hover:brightness-95 transition-all ${getCellColor(item.cls.class_type)}`}
                                title={`${item.cls.class_id} - ${item.cls.class_type}`}
                            >
                                <div className="font-bold truncate">{item.cls.class_id}</div>
                                <div className="truncate opacity-80">{item.sess.room}</div>
                            </div>
                        );
                    })}

                    {/* Fillers for grid lines */}
                    {days.map((d, dayIdx) => (
                        periods.map(p => (
                            <div
                                key={`${d}-${p}`}
                                className="border-r border-b border-gray-100 pointer-events-none"
                                style={{ gridColumn: dayIdx + 2, gridRow: p }}
                            />
                        ))
                    ))}
                </div>
            </div>
        </div>
    );
}
