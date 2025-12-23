
import React from 'react';
import type { Prayer } from '../types';

interface PrayerTimeCardProps {
    prayer: Prayer;
    isCurrent?: boolean;
    isNext?: boolean;
}

const PrayerTimeCard: React.FC<PrayerTimeCardProps> = ({ prayer, isCurrent = false, isNext = false }) => {
    
    const formatTo12Hour = (time24: string): string => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        let hh = parseInt(hours, 10);
        const ampm = hh >= 12 ? 'PM' : 'AM';
        hh = hh % 12;
        hh = hh ? hh : 12;
        const hhStr = hh < 10 ? '0' + hh : String(hh);
        return `${hhStr}:${minutes} ${ampm}`;
    };

    const cardClasses = [
        'relative bg-white/40 backdrop-blur-md p-3 md:p-4 rounded-[1.5rem] shadow-sm border text-center flex flex-col justify-center items-center transition-all duration-500 hover:shadow-xl hover:-translate-y-1',
        isCurrent ? 'border-blue-200 ring-2 ring-blue-500/20 bg-blue-50/30' :
        isNext ? 'border-emerald-200 ring-4 ring-[#158C6E]/10 bg-emerald-50/20 scale-[1.03]' :
        'border-gray-100'
    ].join(' ');

    return (
        <div className={cardClasses}>
            <div className={`w-5 h-5 md:w-6 md:h-6 mb-2 ${isNext ? 'text-[#158C6E]' : 'text-gray-400'}`}>
                {prayer.icon}
            </div>
            <h3 className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 ${isNext ? 'text-[#158C6E]' : 'text-gray-400'}`}>
                {prayer.name}
            </h3>
            <p className={`text-sm md:text-xl font-black tabular-nums ${isNext ? 'text-gray-900' : 'text-gray-600'}`}>
                {formatTo12Hour(prayer.time)}
            </p>
            {isNext && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#158C6E] text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    Next
                </div>
            )}
        </div>
    );
};

export default PrayerTimeCard;
