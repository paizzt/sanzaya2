<?php
require 'vendor/autoload.php';

$base64Photo = base64_encode('test image content');
$apiKey = '5950b44b24860057ff810fe73f58868b';

try {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.imgbb.com/1/upload');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'key' => $apiKey,
        'image' => $base64Photo
    ]));
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        echo 'Error:' . curl_error($ch);
    }
    curl_close($ch);
    echo $result;
} catch (\Exception $e) {
    echo 'Exception: ' . $e->getMessage();
}
