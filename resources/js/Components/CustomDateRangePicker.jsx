import React from 'react';
import Datepicker from "react-tailwindcss-datepicker";

export default function CustomDateRangePicker({ 
    value = {}, 
    onChange, 
    placeholder = "Pilih Rentang Tanggal...",
    primaryColor = "blue",
    showShortcuts = true,
    showFooter = false,
    inputClassName = ""
}) {
    const handleValueChange = (newValue) => {
        if (!onChange) return;
        onChange({
            startDate: newValue ? newValue.startDate : null,
            endDate: newValue ? newValue.endDate : null,
            start_date: newValue ? newValue.startDate : null,
            end_date: newValue ? newValue.endDate : null,
        });
    };

    const startDate = value?.startDate || value?.start_date || null;
    const endDate = value?.endDate || value?.end_date || null;

    return (
        <div className="w-full relative custom-datepicker-container">
            <Datepicker 
                primaryColor={primaryColor}
                value={{
                    startDate: startDate,
                    endDate: endDate
                }}
                onChange={handleValueChange}
                showShortcuts={showShortcuts}
                showFooter={showFooter}
                displayFormat={"DD/MM/YYYY"}
                separator={"s/d"}
                placeholder={placeholder}
                popoverDirection="down"
                configs={{
                    shortcuts: {
                        today: "Hari Ini",
                        yesterday: "Kemarin",
                        past: (period) => `${period} Hari Terakhir`,
                        currentMonth: "Bulan Ini",
                        pastMonth: "Bulan Lalu",
                    },
                    footer: {
                        cancel: "Batal",
                        apply: "Terapkan"
                    }
                }}
                inputClassName={`w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm text-gray-700 transition-colors ${inputClassName}`}
                toggleClassName="absolute right-0 h-full px-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            />
        </div>
    );
}
