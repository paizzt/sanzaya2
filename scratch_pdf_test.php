<?php
$config = [
    'type' => 'bar',
    'data' => [
        'labels' => ['Rumah Sakit Umum Daerah', 'DINAS KESEHATAN KAB', 'RSUD LUWUK', 'RUMKIT BHAYANGKARA'],
        'datasets' => [[
            'label' => 'Penjualan',
            'data' => [180000000, 130000000, 42000000, 21000000],
            'backgroundColor' => '#3b82f6',
        ]]
    ],
    'options' => [
        'plugins' => [
            'datalabels' => [
                'display' => true,
                'align' => 'end',
                'anchor' => 'end',
                'formatter' => "function(value) { return 'Rp ' + (value/1000000) + ' Jt'; }"
            ]
        ]
    ]
];

$url = 'https://quickchart.io/chart';
$data = json_encode(['chart' => $config, 'width' => 600, 'height' => 300]);

$options = [
    'http' => [
        'header'  => "Content-Type: application/json\r\n",
        'method'  => 'POST',
        'content' => $data,
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo "HTTP response: " . $http_response_header[0] . "\n";
echo "Body: " . substr($result, 0, 500) . "\n";
