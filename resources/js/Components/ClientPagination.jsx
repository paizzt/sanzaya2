import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ClientPagination({ total, itemsPerPage, currentPage, onPageChange, onItemsPerPageChange, perPageOptions = [20, 50, 100], alwaysShow = false, iconOnlyNav = false }) {
    if (total === 0) return null;
    if (!alwaysShow && total <= itemsPerPage && !onItemsPerPageChange) return null;

    const totalPages = Math.ceil(total / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, total);

    // Build page numbers
    const getPages = () => {
        const pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible + 2) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            
            const startPage = Math.max(2, currentPage - 1);
            const endPage = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white border-t border-gray-100 gap-4">
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                    Menampilkan <span className="font-medium text-gray-900">{start}</span> - <span className="font-medium text-gray-900">{end}</span> dari <span className="font-medium text-gray-900">{total}</span> data
                </div>
                {onItemsPerPageChange && (
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            onItemsPerPageChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="text-sm border-gray-300 rounded-md py-1 pr-8 pl-3 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-700"
                    >
                        {perPageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt} / baris</option>
                        ))}
                    </select>
                )}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Halaman sebelumnya"
                    title="Halaman sebelumnya"
                    className={`inline-flex items-center justify-center text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        iconOnlyNav ? 'px-2.5 py-1.5 min-w-[34px]' : 'px-3 py-1'
                    }`}
                >
                    {iconOnlyNav ? <ChevronLeft className="w-4 h-4" /> : <>&laquo; Previous</>}
                </button>
                
                {getPages().map((page, idx) => (
                    <button
                        type="button"
                        key={idx}
                        onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                        disabled={typeof page !== 'number'}
                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                            currentPage === page 
                                ? 'bg-blue-600 text-white border-blue-600 font-medium' 
                                : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                        } ${typeof page !== 'number' ? 'border-transparent bg-transparent hover:bg-transparent cursor-default text-gray-400' : ''}`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    aria-label="Halaman selanjutnya"
                    title="Halaman selanjutnya"
                    className={`inline-flex items-center justify-center text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                        iconOnlyNav ? 'px-2.5 py-1.5 min-w-[34px]' : 'px-3 py-1'
                    }`}
                >
                    {iconOnlyNav ? <ChevronRight className="w-4 h-4" /> : <>Next &raquo;</>}
                </button>
            </div>
        </div>
    );
}
