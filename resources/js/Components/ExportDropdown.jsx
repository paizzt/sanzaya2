import React, { useState } from 'react';
import { Download, FileText, Sheet, X, Settings2 } from 'lucide-react';
import Modal from '@/Components/Modal';

export default function ExportDropdown({ pdfRoute, excelRoute, className = '', trigger = null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(pdfRoute ? 'pdf' : 'excel');

    // PDF Settings State
    const [paperSize, setPaperSize] = useState('a4');
    const [orientation, setOrientation] = useState('portrait');
    const [fontFamily, setFontFamily] = useState('sans-serif');
    const [fontSize, setFontSize] = useState('12');

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const buildUrlParams = (url, isPreview = false) => {
        if (!url) return '';
        let resultUrl = url;
        const separator = url.includes('?') ? '&' : '?';
        
        const params = new URLSearchParams();
        if (isPreview) params.append('preview', '1');
        
        if (activeTab === 'pdf') {
            params.append('paper', paperSize);
            params.append('orientation', orientation);
            params.append('font', fontFamily);
            params.append('size', fontSize);
        }
        
        return `${resultUrl}${separator}${params.toString()}`;
    };

    return (
        <>
            {trigger ? (
                <div onClick={(e) => { e.preventDefault(); handleOpen(); }}>
                    {trigger}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleOpen}
                    className={`inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 ${className}`}
                >
                    <Download className="w-5 h-5" />
                    Unduh Data
                </button>
            )}

            <Modal show={isOpen} onClose={handleClose} maxWidth="5xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Pratinjau Data</h2>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Settings Sidebar (Only for PDF) */}
                        {activeTab === 'pdf' && (
                            <div className="w-full md:w-64 flex-shrink-0 bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4 border-b border-gray-200 pb-2">
                                    <Settings2 className="w-4 h-4 text-blue-600" />
                                    Pengaturan PDF
                                </h3>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ukuran Kertas</label>
                                        <select 
                                            value={paperSize} 
                                            onChange={(e) => setPaperSize(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="a4">A4</option>
                                            <option value="f4">F4 (Folio)</option>
                                            <option value="letter">Letter</option>
                                            <option value="legal">Legal</option>
                                            <option value="a3">A3</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Orientasi</label>
                                        <select 
                                            value={orientation} 
                                            onChange={(e) => setOrientation(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="portrait">Potret (Portrait)</option>
                                            <option value="landscape">Lanskap (Landscape)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Jenis Font</label>
                                        <select 
                                            value={fontFamily} 
                                            onChange={(e) => setFontFamily(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="sans-serif">Sans Serif</option>
                                            <option value="serif">Serif</option>
                                            <option value="Arial, Helvetica, sans-serif">Arial</option>
                                            <option value="'Times New Roman', Times, serif">Times New Roman</option>
                                            <option value="monospace">Monospace (Courier)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Ukuran Teks</label>
                                        <select 
                                            value={fontSize} 
                                            onChange={(e) => setFontSize(e.target.value)}
                                            className="w-full border-gray-300 rounded-lg text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="10">10px (Kecil)</option>
                                            <option value="12">12px (Normal)</option>
                                            <option value="14">14px (Sedang)</option>
                                            <option value="16">16px (Besar)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex space-x-2 border-b border-gray-200 mb-4">
                                {pdfRoute && (
                                    <button
                                        onClick={() => setActiveTab('pdf')}
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                            activeTab === 'pdf'
                                                ? 'bg-red-50 text-red-600 border-b-2 border-red-500'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            Pratinjau PDF
                                        </div>
                                    </button>
                                )}
                                {excelRoute && (
                                    <button
                                        onClick={() => setActiveTab('excel')}
                                        className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                            activeTab === 'excel'
                                                ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-500'
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sheet className="w-4 h-4" />
                                            Pratinjau Excel
                                        </div>
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-2 h-[60vh]">
                                {activeTab === 'pdf' && pdfRoute && (
                                    <iframe 
                                        src={buildUrlParams(pdfRoute, true)} 
                                        className="w-full h-full rounded-lg bg-white"
                                        title="PDF Preview"
                                    />
                                )}
                                {activeTab === 'excel' && excelRoute && (
                                    <iframe 
                                        src={buildUrlParams(excelRoute, true)} 
                                        className="w-full h-full rounded-lg bg-white"
                                        title="Excel Preview"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                        >
                            Tutup
                        </button>
                        {activeTab === 'pdf' && pdfRoute && (
                            <a
                                href={buildUrlParams(pdfRoute, false)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Unduh PDF
                            </a>
                        )}
                        {activeTab === 'excel' && excelRoute && (
                            <a
                                href={buildUrlParams(excelRoute, false)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Unduh Excel
                            </a>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
