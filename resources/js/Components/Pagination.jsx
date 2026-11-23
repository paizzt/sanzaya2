import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ links, from, to, total }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-col md:flex-row justify-between items-center px-4 sm:px-6 py-4 bg-white border-t border-gray-100 gap-3 sm:gap-4">
            <div className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-900">{from || 0}</span> - <span className="font-medium text-gray-900">{to || 0}</span> dari <span className="font-medium text-gray-900">{total || 0}</span> data
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-1">
                {links.map((link, index) => {
                    const labelStr = String(link.label || '');
                    const isPrev = index === 0 || /previous|&laquo;|«/i.test(labelStr);
                    const isNext = index === links.length - 1 || /next|&raquo;|»/i.test(labelStr);
                    const isArrow = isPrev || isNext;
                    const navTitle = isPrev ? 'Halaman sebelumnya' : isNext ? 'Halaman selanjutnya' : undefined;

                    if (link.url === null) {
                        return (
                            <div
                                key={index}
                                aria-label={navTitle}
                                title={navTitle}
                                className={`inline-flex items-center justify-center text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed ${
                                    isArrow ? 'px-2.5 py-1.5 min-w-[34px]' : 'px-3 py-1'
                                }`}
                            >
                                {isPrev ? (
                                    <ChevronLeft className="w-4 h-4" />
                                ) : isNext ? (
                                    <ChevronRight className="w-4 h-4" />
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                )}
                            </div>
                        );
                    }
                    
                    return (
                        <Link
                            key={index}
                            href={link.url}
                            aria-label={navTitle}
                            title={navTitle}
                            className={`inline-flex items-center justify-center text-sm border rounded-md transition-colors ${
                                isArrow ? 'px-2.5 py-1.5 min-w-[34px]' : 'px-3 py-1'
                            } ${
                                link.active 
                                    ? 'bg-blue-600 text-white border-blue-600 font-medium' 
                                    : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {isPrev ? (
                                <ChevronLeft className="w-4 h-4" />
                            ) : isNext ? (
                                <ChevronRight className="w-4 h-4" />
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
