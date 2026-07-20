<?php
$f = 'resources/js/Pages/Reports/Index.jsx';
$c = file_get_contents($f);

// 1. Add imports and state
if (strpos($c, 'import Modal') === false) {
    $c = str_replace("import { Head", "import Modal from '@/Components/Modal';\nimport { Head", $c);
}
if (strpos($c, 'detailModal') === false) {
    $c = preg_replace('/const \[searchTerm, setSearchTerm\] = useState\([^)]*\);/', "$0\n    const [detailModal, setDetailModal] = useState({ isOpen: false, title: '', type: '', data: null });", $c);
}

// 2. Modify onClicks for Logistik cards
// We have to be careful to only replace the onClick for the logistik cards.
// They are inside {tab === 'logistik' && summary && ( ... )}

// Find the block for logistik
$logistikStart = strpos($c, "{tab === 'logistik' && summary && (");
$pesananStart = strpos($c, "{tab === 'pesanan' && summaryPesanan && (");

$logistikBlock = substr($c, $logistikStart, $pesananStart - $logistikStart);

// Total Penjualan
$logistikBlock = preg_replace(
    '/<div onClick=\{[^}]+\} (className="[^"]+Total Penjualan[^>]+>)/s', // This regex is wrong because "Total Penjualan" is inside the div, not in the className.
    'replacement',
    $logistikBlock
);

// Better way: regex that matches the div and the title inside it
$pattern = '/<div onClick=\{[^}]+\}\s+className="([^"]+)">\s*<div className="flex justify-between items-start mb-4">\s*<div className="min-w-0 flex-1 pr-4">\s*<p className="text-sm font-semibold text-gray-500 truncate">(Total Penjualan|Total Pesanan|Top Outlet|Top Produk)<\/p>/is';

$logistikBlock = preg_replace_callback($pattern, function($m) {
    $title = $m[2];
    $type = '';
    $dataField = '';
    if ($title === 'Total Penjualan') { $type = 'penjualan'; $dataField = 'penjualan_detail'; }
    if ($title === 'Total Pesanan') { $type = 'pesanan'; $dataField = 'pesanan_detail'; }
    if ($title === 'Top Outlet') { $type = 'outlet'; $dataField = 'outlet_detail'; }
    if ($title === 'Top Produk') { $type = 'produk'; $dataField = 'produk_detail'; }
    
    $onClick = "onClick={() => setDetailModal({ isOpen: true, title: '$title', type: '$type', data: summary.$dataField })}";
    return "<div $onClick className=\"{$m[1]}\">\n                            <div className=\"flex justify-between items-start mb-4\">\n                                <div className=\"min-w-0 flex-1 pr-4\">\n                                    <p className=\"text-sm font-semibold text-gray-500 truncate\">$title</p>";
}, $logistikBlock);

$c = substr_replace($c, $logistikBlock, $logistikStart, $pesananStart - $logistikStart);

// 3. Add Modal to the bottom
$modalCode = <<<'EOD'
                {/* Detail Modal */}
                <Modal show={detailModal.isOpen} onClose={() => setDetailModal({ ...detailModal, isOpen: false })} maxWidth="md">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-800">Detail {detailModal.title}</h3>
                            <button onClick={() => setDetailModal({ ...detailModal, isOpen: false })} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {!detailModal.data || Object.keys(detailModal.data).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Tidak ada detail data yang tersedia.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider px-3 pb-2 border-b border-gray-100">
                                        <span>{detailModal.type === 'penjualan' || detailModal.type === 'pesanan' ? 'Nama Sales' : (detailModal.type === 'outlet' ? 'Nama Outlet' : 'Nama Produk')}</span>
                                        <span>{detailModal.type === 'penjualan' ? 'Total (Rp)' : 'Jumlah'}</span>
                                    </div>
                                    {Object.entries(detailModal.data).map(([key, value], idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50/50 hover:bg-gray-50 rounded-xl border border-gray-100 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0 pr-4">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 truncate" title={key}>{key}</span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 shrink-0 whitespace-nowrap">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Modal>
            </AuthenticatedLayout>
EOD;

$c = str_replace('</AuthenticatedLayout>', $modalCode, $c);

file_put_contents($f, $c);
echo "Patched Reports/Index.jsx to show modal\n";
