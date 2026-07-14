import React from 'react';
import Datepicker from "react-tailwindcss-datepicker";

export default function CustomDateRangePicker({ value, onChange }) {
    const handleValueChange = (newValue) => {
        onChange({
            startDate: newValue.startDate,
            endDate: newValue.endDate
        });
    };

    return (
        <div className="w-full relative custom-datepicker-container">
            <Datepicker 
                primaryColor={"emerald"}
                value={{
                    startDate: value.startDate || null,
                    endDate: value.endDate || null
                }}
                onChange={handleValueChange}
                showShortcuts={true}
                showFooter={true}
                displayFormat={"DD MMM YYYY"}
                separator={"sampai"}
                placeholder={"Pilih Rentang Tanggal"}
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
                inputClassName="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-gray-700 transition-colors"
                toggleClassName="absolute right-0 h-full px-3 text-gray-400 focus:outline-none"
            />
        </div>
    );
}
