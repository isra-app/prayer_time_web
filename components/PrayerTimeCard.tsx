import React from 'react';
import type { Prayer } from '../types';

interface PrayerTimeCardProps {
    prayer: Prayer;
    isCurrent?: boolean;
    countdown?: string;
}

const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({ prayer, isCurrent = false, countdown }) => {
    
    const formatTo12Hour = (time24: string): string => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let hh = parseInt(hours, 10);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12;
        hh = hh ? hh : 12; // The hour '0' should be '12'
        const hhStr = hh < 10 ? '0' + hh : String(hh);
        
        return `${hhStr}:${minutes} ${ampm}`;
    };

    return (
        <div className={`relative bg-white bg-opacity-60 backdrop-blur-sm p-2 rounded-xl shadow-md border text-center flex flex-col justify-between items-center transition-all duration-300 hover:bg-white hover:shadow-lg hover:scale-105 flex-1 min-w-[120px] ${isCurrent ? 'border-transparent ring-2 ring-[#158C6E] shadow-xl scale-105' : 'border-gray-200/80'}`}>
            <div className="text-[#158C6E] w-6 h-6 mb-1">
                {prayer.icon}
            </div>
            <h3 className="text-sm font-semibold text-gray-700">{prayer.name}</h3>
            <p className="text-lg font-bold text-gray-900">{formatTo12Hour(prayer.time)}</p>
            {isCurrent && countdown && (
                <div className="mt-1 text-xs font-semibold text-[#158C6E]">
                    <span>{countdown}</span>
                </div>
            )}
        </div>
    );
};

export default PrayerTimeCard;