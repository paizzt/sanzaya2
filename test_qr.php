<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$qr = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('svg')
    ->size(300)
    ->errorCorrection('H')
    ->generate('test with logo embedded manually in SVG');

$logoPath = public_path('img/logo.png');
if (file_exists($logoPath)) {
    $logoData = base64_encode(file_get_contents($logoPath));
    $logoSize = 80; // slightly bigger logo
    $x = (300 - $logoSize) / 2;
    $y = (300 - $logoSize) / 2;
    $imageTag = '<image x="'.$x.'" y="'.$y.'" width="'.$logoSize.'" height="'.$logoSize.'" href="data:image/png;base64,'.$logoData.'" preserveAspectRatio="xMidYMid meet" />';
    $qr = str_replace('</svg>', $imageTag . '</svg>', $qr);
}

file_put_contents('test_qr.svg', $qr);
echo "Done\n";
