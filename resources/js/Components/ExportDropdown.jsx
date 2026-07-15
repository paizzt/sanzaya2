import React from 'react';
import Dropdown from '@/Components/Dropdown';
import { Download, FileText, Sheet } from 'lucide-react';

export default function ExportDropdown({ pdfRoute, excelRoute, className = '' }) {
    return (
        <Dropdown>
            <Dropdown.Trigger>
                <button
                    type="button"
                    className={`inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 ${className}`}
                >
                    <Download className="w-5 h-5" />
                    Unduh Data
                </button>
            </Dropdown.Trigger>

            <Dropdown.Content width="48" align="right">
                <div className="py-1">
                    {pdfRoute && (
                        <a
                            href={pdfRoute}
                            className="block w-full px-4 py-2.5 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none flex items-center gap-3 font-medium"
                        >
                            <FileText className="w-4 h-4 text-red-500" />
                            Unduh PDF
                        </a>
                    )}
                    {excelRoute && (
                        <a
                            href={excelRoute}
                            className="block w-full px-4 py-2.5 text-left text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:outline-none flex items-center gap-3 font-medium"
                        >
                            <Sheet className="w-4 h-4 text-emerald-600" />
                            Unduh Excel
                        </a>
                    )}
                </div>
            </Dropdown.Content>
        </Dropdown>
    );
}
