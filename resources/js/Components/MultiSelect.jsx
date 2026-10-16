import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

export default function MultiSelect({ value = [], onChange, options = [], placeholder = "Pilih...", className = "", icon: Icon }) {
    // value is an array of selected option values
    const selectedOptions = options.filter(opt => value.includes(String(opt.value)));
    const isAllSelected = value.length === 0 || (options.length > 0 && selectedOptions.length === options.length);

    const getDisplayLabel = () => {
        if (isAllSelected) return placeholder;
        if (selectedOptions.length === 1) return selectedOptions[0].label;
        if (selectedOptions.length <= 2) return selectedOptions.map(opt => opt.label).join(', ');
        return `${selectedOptions.length} Terpilih`;
    };

    const handleSelectAll = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange([]);
    };

    const handleOptionToggle = (optVal) => {
        const strVal = String(optVal);
        let newValues;
        if (value.includes(strVal)) {
            newValues = value.filter(v => v !== strVal);
        } else {
            newValues = [...value, strVal];
        }

        if (newValues.length === 0 || newValues.length === options.length) {
            onChange([]);
        } else {
            onChange(newValues);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <Listbox value={value} onChange={() => {}} multiple>
                <div className="relative">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-2.5 text-left border border-gray-300 shadow-sm hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 pl-4 pr-10">
                        {Icon && (
                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Icon className="h-4 w-4" />
                            </span>
                        )}
                        <span className={`block truncate ${Icon ? 'ml-7' : ''} ${isAllSelected ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                            {getDisplayLabel()}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 focus:outline-none sm:text-sm">
                            {/* Opsi Semua PT di paling atas */}
                            <div
                                onClick={handleSelectAll}
                                className={`relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors border-b border-gray-100 ${
                                    isAllSelected
                                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                                        : 'text-gray-900 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                            >
                                <span className="block truncate">
                                    {placeholder}
                                </span>
                                {isAllSelected && (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                )}
                            </div>

                            {/* Opsi Individual PT */}
                            {options.map((option, idx) => {
                                const isSelected = value.includes(String(option.value));
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleOptionToggle(option.value)}
                                        className={`relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                                            isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-900 hover:bg-indigo-50 hover:text-indigo-700'
                                        }`}
                                    >
                                        <span className={`block truncate ${isSelected ? 'font-bold text-indigo-700' : 'font-normal text-gray-900'}`}>
                                            {option.label}
                                        </span>
                                        {isSelected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                <Check className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
