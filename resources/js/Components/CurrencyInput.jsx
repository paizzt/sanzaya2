import React from 'react';

export default function CurrencyInput({ value, onChange, className = '', ...props }) {
    // Format the number to have . for thousands
    const formatValue = (val) => {
        if (val === null || val === undefined || val === '') return '';
        
        let strVal = val.toString();
        // Get only digits
        let number_string = strVal.replace(/[^0-9]/g, '');
        if (number_string === '') return '';

        let sisa = number_string.length % 3;
        let rupiah = number_string.substr(0, sisa);
        let ribuan = number_string.substr(sisa).match(/\d{3}/g);

        if (ribuan) {
            let separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        return rupiah;
    };

    const handleChange = (e) => {
        let val = e.target.value;
        // Remove everything except numbers
        val = val.replace(/[^0-9]/g, '');

        if (val === '') {
            onChange('');
            return;
        }

        // Pass the raw number back to the parent
        onChange(val);
    };

    return (
        <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
            <input
                {...props}
                type="text"
                className={
                    'block w-full pl-9 pr-10 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                    className
                }
                value={formatValue(value)}
                onChange={handleChange}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium pointer-events-none">,00</span>
        </div>
    );
}
