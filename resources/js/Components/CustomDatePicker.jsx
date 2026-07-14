import React from 'react';
import Datepicker from "react-tailwindcss-datepicker";

export default function CustomDatePicker({ value, onChange, placeholder = "Pilih Tanggal" }) {
    const handleValueChange = (newValue) => {
        onChange(newValue ? newValue.startDate : '');
    };

    return (
        <div className="w-full relative custom-datepicker-container">
            <Datepicker 
                primaryColor={"emerald"}
                asSingle={true}
                useRange={false}
                value={{
                    startDate: value || null,
                    endDate: value || null
                }}
                onChange={handleValueChange}
                showShortcuts={false}
                showFooter={true}
                displayFormat={"DD MMM YYYY"}
                placeholder={placeholder}
                inputClassName="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm text-gray-700 transition-colors"
                toggleClassName="absolute right-0 h-full px-3 text-gray-400 focus:outline-none"
            />
        </div>
    );
}
