<?php
$f = 'resources/js/Pages/Requests/BhpRecap.jsx';
$c = file_get_contents($f);
$c = preg_replace(
    '/<a\s+href=\{route\(\'requests\.bhp\.pdf\',\s*selectedRequest\.id\)\}\s+className="([^"]+)"\s*>\s*(.*?)\s*<\/a>/s',
    '<ExportDropdown pdfRoute={route(\'requests.bhp.pdf\', selectedRequest.id)} trigger={
                                <button className="$1">
                                    $2
                                </button>
                            } />',
    $c
);
file_put_contents($f, $c);
echo "Patched second a in BhpRecap\n";
