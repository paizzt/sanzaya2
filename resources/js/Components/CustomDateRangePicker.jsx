import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import dayjs from 'dayjs';

export default function CustomDateRangePicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const shortcuts = [
        { label: '1 Minggu', getValue: () => ({ startDate: dayjs().startOf('week').add(1, 'day').format('YYYY-MM-DD'), endDate: dayjs().endOf('week').add(1, 'day').format('YYYY-MM-DD') }) }, // Monday to Sunday
        { label: '1 Bulan', getValue: () => ({ startDate: dayjs().startOf('month').format('YYYY-MM-DD'), endDate: dayjs().endOf('month').format('YYYY-MM-DD') }) },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleShortcut = (shortcut) => {
        onChange(shortcut.getValue());
        setIsOpen(false);
    };

    const displayValue = value.startDate && value.endDate
        ? `${dayjs(value.startDate).format('MMM D, YYYY')} - ${dayjs(value.endDate).format('MMM D, YYYY')}`
        : 'Pilih Rentang Tanggal';

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm flex justify-between items-center text-gray-700"
            >
                <span className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    {displayValue}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden w-[280px] sm:w-[320px] md:w-[480px] left-0 sm:left-auto">
                    {/* Shortcuts Sidebar */}
                    <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-2 flex flex-col gap-1">
                        {shortcuts.map((shortcut, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleShortcut(shortcut)}
                                className="text-left px-3 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
                            >
                                {shortcut.label}
                            </button>
                        ))}
                    </div>

                    {/* Custom Date Inputs */}
                    <div className="w-full md:w-2/3 p-4 flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Dari (Start Date)</label>
                            <input
                                type="date"
                                value={value.startDate || ''}
                                onChange={(e) => onChange({ ...value, startDate: e.target.value })}
                                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sampai (End Date)</label>
                            <input
                                type="date"
                                value={value.endDate || ''}
                                onChange={(e) => onChange({ ...value, endDate: e.target.value })}
                                className="w-full border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>
                        
                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
