<?php
$c = file_get_contents('resources/js/Components/ExportDropdown.jsx');
$c = str_replace(
    'export default function ExportDropdown({ pdfRoute, excelRoute, className = \'\' }) {',
    'export default function ExportDropdown({ pdfRoute, excelRoute, className = \'\', trigger = null }) {',
    $c
);
$c = str_replace(
    '<button
                type="button"
                onClick={handleOpen}
                className={`inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-emerald-500/30 ${className}`}
            >
                <Download className="w-5 h-5" />
                Unduh Data
            </button>',
    '{trigger ? (
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
            )}',
    $c
);
file_put_contents('resources/js/Components/ExportDropdown.jsx', $c);
echo 'Patched ExportDropdown.jsx';
