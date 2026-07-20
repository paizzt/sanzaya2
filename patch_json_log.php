<?php
$file = 'resources/js/Pages/System/ActivityLog.jsx';
$content = file_get_contents($file);

$helperComponent = "
    const renderJsonData = (jsonString) => {
        if (!jsonString) return <span className=\"text-gray-400 italic\">Tidak ada data</span>;
        try {
            const data = JSON.parse(jsonString);
            if (Object.keys(data).length === 0) return <span className=\"text-gray-400 italic\">Data kosong</span>;
            
            return (
                <div className=\"space-y-2\">
                    {Object.entries(data).map(([key, value]) => (
                        <div key={key} className=\"flex flex-col sm:flex-row sm:gap-4 border-b border-gray-200/50 pb-2 last:border-0 last:pb-0\">
                            <div className=\"sm:w-1/3 font-medium text-gray-700 capitalize text-xs\">
                                {key.replace(/_/g, ' ')}
                            </div>
                            <div className=\"sm:w-2/3 text-gray-600 break-all text-xs font-mono bg-white/50 px-2 py-1 rounded\">
                                {value === null ? <span className=\"text-gray-400 italic\">Kosong</span> : String(value)}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return <span className=\"text-red-500\">Format data tidak valid</span>;
        }
    };
";

// Insert helper function before return statement of the Index component
$pos = strpos($content, 'return (');
if ($pos !== false) {
    $content = substr_replace($content, $helperComponent . "\n    ", $pos, 0);
}

// Replace the <pre> blocks
// 1. Data Lama
$oldBlock = '<pre className="text-gray-700 whitespace-pre-wrap font-mono text-xs">
                                            {selectedLog?.old_values ? JSON.stringify(JSON.parse(selectedLog.old_values), null, 2) : \'Tidak ada data lama\'}
                                        </pre>';
$content = str_replace($oldBlock, '{renderJsonData(selectedLog?.old_values)}', $content);

// 2. Data Baru
$newBlock = '<pre className="text-gray-700 whitespace-pre-wrap font-mono text-xs">
                                            {selectedLog?.new_values ? JSON.stringify(JSON.parse(selectedLog.new_values), null, 2) : \'Tidak ada data baru\'}
                                        </pre>';
$content = str_replace($newBlock, '{renderJsonData(selectedLog?.new_values)}', $content);

// 3. Other actions block
$otherBlock = '<pre className="text-gray-700 whitespace-pre-wrap font-mono text-xs">
                                        {selectedLog?.action === \'Deleted\' 
                                            ? (selectedLog?.old_values ? JSON.stringify(JSON.parse(selectedLog.old_values), null, 2) : \'-\')
                                            : (selectedLog?.new_values ? JSON.stringify(JSON.parse(selectedLog.new_values), null, 2) : \'-\')
                                        }
                                    </pre>';
$content = str_replace($otherBlock, '{renderJsonData(selectedLog?.action === \'Deleted\' ? selectedLog?.old_values : selectedLog?.new_values)}', $content);

file_put_contents($file, $content);
echo "Patched ActivityLog.jsx\n";
