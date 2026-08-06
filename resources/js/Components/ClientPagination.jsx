import React from 'react';

export default function ClientPagination({ total, itemsPerPage, currentPage, onPageChange }) {
    if (total <= itemsPerPage) return null;

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
            <div className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-900">{start}</span> - <span className="font-medium text-gray-900">{end}</span> dari <span className="font-medium text-gray-900">{total}</span> data
            </div>
            
            <div className="flex flex-wrap justify-center gap-1">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    &laquo; Previous
                </button>
                
                {getPages().map((page, idx) => (
                    <button
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
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next &raquo;
                </button>
            </div>
        </div>
    );
}
