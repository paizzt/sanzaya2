const fs = require('fs');
let content = fs.readFileSync('resources/js/Pages/Reports/Index.jsx', 'utf8');

// 1. Add isDesktop
content = content.replace(
    "const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });",
    "const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });\n    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);\n\n    useEffect(() => {\n        if (typeof window !== 'undefined') {\n            const handleResize = () => setIsDesktop(window.innerWidth >= 1024);\n            window.addEventListener('resize', handleResize);\n            return () => window.removeEventListener('resize', handleResize);\n        }\n    }, []);"
);

// 2. Find detailModal logic
const startDetail = content.indexOf('{!detailModal.data || Object.keys(detailModal.data).length === 0 ? (');
const endDetail = content.indexOf('</Modal>');
// Finding the precise end of detail content by searching backwards from `</Modal>`
const detailContentStr = content.substring(startDetail, content.lastIndexOf('</div>', content.lastIndexOf('</div>', endDetail - 1) - 1));

// 3. Add renderDetailContent
const renderFunc = '    const renderDetailContent = () => (\n        <>\n            ' + detailContentStr + '\n        </>\n    );\n\n';
content = content.replace('    // Chart Renderers', renderFunc + '    // Chart Renderers');

// 4. Wrap Charts Area
const startChartsStr = '{/* Charts Area */}';
const wrappedStart = `                {isDesktop && detailModal.isOpen ? (
                    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Detail {detailModal.title}</h3>
                            <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Kembali
                            </button>
                        </div>
                        <div className="custom-scrollbar max-h-[80vh] overflow-y-auto pr-2">
                            {renderDetailContent()}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Charts Area */}`;
content = content.replace(startChartsStr, wrappedStart);

// 5. Wrap Detail Modal
const oldModalStr = `{/* Detail Modal */}
                <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth="md">
                    <div className="p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Detail {detailModal.title}</h3>
                            <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">`;

// Need to match exactly what is in the file. Wait, in the file it might be slightly different.
// So I will just use indexOf
const modalStart = content.indexOf('{/* Detail Modal */}');
const modalEnd = content.indexOf('</Modal>', modalStart) + '</Modal>'.length;
const oldModalFullStr = content.substring(modalStart, modalEnd);

const newModalFullStr = `                    </>
                )}

                {/* Detail Modal (Hanya Mobile) */}
                {!isDesktop && (
                    <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth="md">
                        <div className="p-4 sm:p-6">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <h3 className="text-xl font-bold text-gray-800">Detail {detailModal.title}</h3>
                                <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            
                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                {renderDetailContent()}
                            </div>
                        </div>
                    </Modal>
                )}`;

content = content.replace(oldModalFullStr, newModalFullStr);

fs.writeFileSync('resources/js/Pages/Reports/Index.jsx', content);
console.log('Success');
