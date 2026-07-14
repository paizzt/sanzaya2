import { Fragment, useState, useRef } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function SearchableSelect({ value, onChange, options, placeholder = "Cari atau pilih...", className = "", icon: Icon }) {
    const [query, setQuery] = useState('');
    const buttonRef = useRef(null);

    const filteredOptions =
        query === ''
            ? options
            : options.filter((option) =>
                  option.label
                      .toLowerCase()
                      .replace(/\s+/g, '')
                      .includes(query.toLowerCase().replace(/\s+/g, ''))
              );

    const selectedOption = options.find(opt => String(opt.value) === String(value)) || null;

    return (
        <div className={`relative ${className}`}>
            <Combobox value={value} onChange={onChange}>
                {({ open }) => (
                    <div className="relative mt-1">
                        <div className="relative w-full cursor-default overflow-hidden rounded-xl bg-white text-left border border-gray-300 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500 sm:text-sm transition-all duration-200">
                            {Icon && (
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Icon className="h-4 w-4" />
                                </span>
                            )}
                            <Combobox.Input
                                className={`w-full border-none py-2.5 pr-10 text-sm leading-5 text-gray-900 focus:ring-0 cursor-text ${Icon ? 'pl-10' : 'pl-4'}`}
                                displayValue={(val) => {
                                    const opt = options.find(o => String(o.value) === String(val));
                                    return opt ? opt.label : '';
                                }}
                                onChange={(event) => setQuery(event.target.value)}
                                onFocus={() => {
                                    if (!open && buttonRef.current) {
                                        buttonRef.current.click();
                                    }
                                }}
                                onClick={() => {
                                    if (!open && buttonRef.current) {
                                        buttonRef.current.click();
                                    }
                                }}
                                placeholder={placeholder}
                            />
                            <Combobox.Button ref={buttonRef} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
                            </Combobox.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                            afterLeave={() => setQuery('')}
                        >
                            <Combobox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] ring-1 ring-black/5 focus:outline-none sm:text-sm">
                                {filteredOptions.length === 0 && query !== '' ? (
                                    <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                                        Pencarian tidak ditemukan.
                                    </div>
                                ) : (
                                    filteredOptions.map((option, idx) => (
                                        <Combobox.Option
                                            key={idx}
                                            className={({ active }) =>
                                                `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                                                    active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-900'
                                                }`
                                            }
                                            value={option.value}
                                        >
                                            {({ selected, active }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-bold text-indigo-700' : 'font-normal'}`}>
                                                        {option.label}
                                                    </span>
                                                    {selected ? (
                                                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-indigo-700' : 'text-indigo-600'}`}>
                                                            <Check className="h-4 w-4" aria-hidden="true" />
                                                        </span>
                                                    ) : null}
                                                </>
                                            )}
                                        </Combobox.Option>
                                    ))
                                )}
                            </Combobox.Options>
                        </Transition>
                    </div>
                )}
            </Combobox>
        </div>
    );
}
