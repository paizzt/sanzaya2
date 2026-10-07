const fs = require('fs');

let lines = fs.readFileSync('resources/js/Pages/Reports/Index.jsx', 'utf8').split('\n');

// 1. Find line index for `{!detailModal.data...` and `</Modal>`
let startDetailIdx = -1;
let endDetailIdx = -1;
let chartAreaIdx = -1;
let modalAreaIdx = -1;
let renderLogistikIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{!detailModal.data || Object.keys(detailModal.data).length === 0 ? (')) {
        startDetailIdx = i;
    }
    if (lines[i].includes('</Modal>')) {
        endDetailIdx = i;
    }
    if (lines[i].includes('{/* Charts Area */}')) {
        chartAreaIdx = i;
    }
    if (lines[i].includes('{/* Detail Modal */}')) {
        modalAreaIdx = i;
    }
    if (lines[i].includes('const renderLogistikChart = () => {')) {
        renderLogistikIdx = i;
    }
}

// 2. Extract detail content
// Detail content starts at startDetailIdx, ends right before `</div>` then `</div>` then `</Modal>`.
// By looking at lines, </Modal> is at 1251, </div> is at 1250, </div> is at 1249.
// So detail content ends at endDetailIdx - 3.
let detailContentLines = lines.slice(startDetailIdx, endDetailIdx - 2);

// 3. Insert `renderDetailContent` above `renderLogistikChart`
let renderFuncLines = [
    '    const renderDetailContent = () => (',
    '        <>',
    ...detailContentLines,
    '        </>',
    '    );',
    ''
];

lines.splice(renderLogistikIdx, 0, ...renderFuncLines);

// Update indices since lines were inserted
let offset = renderFuncLines.length;
chartAreaIdx += offset;
modalAreaIdx += offset;
startDetailIdx += offset;
endDetailIdx += offset;

// 4. Wrap charts area and table area
// from `chartAreaIdx` up to `modalAreaIdx - 1`.
let chartsAndTables = lines.slice(chartAreaIdx, modalAreaIdx);

let wrappedLines = [
    '                {isDesktop && detailModal.isOpen ? (',
    '                    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">',
    '                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">',
    '                            <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Detail {detailModal.title}</h3>',
    '                            <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors">',
    '                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>',
    '                                Kembali',
    '                            </button>',
    '                        </div>',
    '                        <div className="custom-scrollbar max-h-[80vh] overflow-y-auto pr-2">',
    '                            {renderDetailContent()}',
    '                        </div>',
    '                    </div>',
    '                ) : (',
    '                    <>',
    ...chartsAndTables,
    '                    </>',
    '                )}'
];

lines.splice(chartAreaIdx, chartsAndTables.length, ...wrappedLines);

// Update modalAreaIdx again
offset = wrappedLines.length - chartsAndTables.length;
modalAreaIdx += offset;
startDetailIdx += offset;
endDetailIdx += offset;

// 5. Replace Modal content to use renderDetailContent
// Lines from modalAreaIdx to endDetailIdx inclusive
let newModalLines = [
    '                {/* Detail Modal (Hanya Mobile) */}',
    '                {!isDesktop && (',
    '                    <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth="md">',
    '                        <div className="p-4 sm:p-6">',
    '                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">',
    '                                <h3 className="text-xl font-bold text-gray-800">Detail {detailModal.title}</h3>',
    '                                <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">',
    '                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>',
    '                                </button>',
    '                            </div>',
    '                            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">',
    '                                {renderDetailContent()}',
    '                            </div>',
    '                        </div>',
    '                    </Modal>',
    '                )}'
];

lines.splice(modalAreaIdx, endDetailIdx - modalAreaIdx + 1, ...newModalLines);

fs.writeFileSync('resources/js/Pages/Reports/Index.jsx', lines.join('\n'));
console.log('Success');
