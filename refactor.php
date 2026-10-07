<?php

$file = 'resources/js/Pages/Reports/Index.jsx';
$content = file_get_contents($file);

// 1. Add isDesktop state
$stateHook = "const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });\n    const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);\n\n    useEffect(() => {\n        if (typeof window !== 'undefined') {\n            const handleResize = () => setIsDesktop(window.innerWidth >= 1024);\n            window.addEventListener('resize', handleResize);\n            return () => window.removeEventListener('resize', handleResize);\n        }\n    }, []);";
$content = str_replace("const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });", $stateHook, $content);

// 2. Extract renderDetailContent
$lines = explode("\n", $content);
$detailStart = -1;
$detailEnd = -1;

for ($i = 0; $i < count($lines); $i++) {
    if (strpos($lines[$i], '{!detailModal.data || Object.keys(detailModal.data).length === 0 ? (') !== false) {
        $detailStart = $i;
    }
    if (strpos($lines[$i], '</Modal>') !== false) {
        $detailEnd = $i - 3;
        break;
    }
}

$detailContentLines = array_slice($lines, $detailStart, $detailEnd - $detailStart + 1);
$detailContentStr = implode("\n", $detailContentLines);

// Add the renderDetailContent function
$renderDetailContentFunc = "    const renderDetailContent = () => (\n        <>\n" . $detailContentStr . "\n        </>\n    );\n\n";
$content = str_replace("    const renderLogistikChart = () => {", $renderDetailContentFunc . "    const renderLogistikChart = () => {", $content);

// 3. Wrap Charts & Tables
$lines = explode("\n", $content);
$chartStart = -1;
$tableEnd = -1;
for ($i = 0; $i < count($lines); $i++) {
    if (strpos($lines[$i], '{/* Charts Area */}') !== false) {
        $chartStart = $i;
    }
    if (strpos($lines[$i], '{/* Detail Modal */}') !== false) {
        $tableEnd = $i - 1;
        break;
    }
}

$chartsAndTablesStr = implode("\n", array_slice($lines, $chartStart, $tableEnd - $chartStart + 1));
$wrappedChartsAndTables = "                {isDesktop && detailModal.isOpen ? (
                    <div className=\"bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6\">
                        <div className=\"flex justify-between items-center mb-6 border-b border-gray-100 pb-4\">
                            <h3 className=\"text-xl sm:text-2xl font-bold text-gray-800\">Detail {detailModal.title}</h3>
                            <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className=\"flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors\">
                                <svg className=\"w-4 h-4\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M10 19l-7-7m0 0l7-7m-7 7h18\" /></svg>
                                Kembali
                            </button>
                        </div>
                        <div className=\"custom-scrollbar max-h-[80vh] overflow-y-auto pr-2\">
                            {renderDetailContent()}
                        </div>
                    </div>
                ) : (
                    <>
" . $chartsAndTablesStr . "
                    </>
                )}";

$content = str_replace($chartsAndTablesStr, $wrappedChartsAndTables, $content);

// 4. Update the Modal
$lines = explode("\n", $content);
$oldModalStart = -1;
$oldModalEnd = -1;
for ($i = 0; $i < count($lines); $i++) {
    if (strpos($lines[$i], '{/* Detail Modal */}') !== false) {
        $oldModalStart = $i;
    }
    if (strpos($lines[$i], '</Modal>') !== false) {
        $oldModalEnd = $i;
        break;
    }
}

$oldModalStr = implode("\n", array_slice($lines, $oldModalStart, $oldModalEnd - $oldModalStart + 1));
$newModalStr = "                            {/* Detail Modal (Hanya Mobile) */}
                {!isDesktop && (
                    <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth=\"md\">
                        <div className=\"p-4 sm:p-6\">
                            <div className=\"flex justify-between items-center mb-6 border-b border-gray-100 pb-4\">
                                <h3 className=\"text-xl font-bold text-gray-800\">Detail {detailModal.title}</h3>
                                <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className=\"text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors\">
                                    <svg className=\"w-5 h-5\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M6 18L18 6M6 6l12 12\" /></svg>
                                </button>
                            </div>
                            
                            <div className=\"max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar\">
                                {renderDetailContent()}
                            </div>
                        </div>
                    </Modal>
                )}";

$content = str_replace($oldModalStr, $newModalStr, $content);

file_put_contents($file, $content);
echo "Done refactoring.";
?>
