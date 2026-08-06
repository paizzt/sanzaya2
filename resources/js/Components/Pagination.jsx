import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links, from, to, total }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-white border-t border-gray-100 gap-4">
            <div className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-900">{from || 0}</span> - <span className="font-medium text-gray-900">{to || 0}</span> dari <span className="font-medium text-gray-900">{total || 0}</span> data
            </div>
            
            <div className="flex flex-wrap justify-center gap-1">
                {links.map((link, index) => {
                    if (link.url === null) {
                        return (
                            <div
                                key={index}
                                className="px-3 py-1 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        );
                    }
                    
                    return (
                        <Link
                            key={index}
                            href={link.url}
                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                                link.active 
                                    ? 'bg-blue-600 text-white border-blue-600 font-medium' 
                                    : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
