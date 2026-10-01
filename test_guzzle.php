<?php
require 'vendor/autoload.php';
use Illuminate\Support\Facades\Http;

try {
    $response = Http::asForm()->post('https://api.imgbb.com/1/upload', [
        'key' => '5950b44b24860057ff810fe73f58868b',
        'image' => base64_encode('test'),
    ]);
    echo "Response: " . $response->status() . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
