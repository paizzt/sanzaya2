<?php
require 'vendor/autoload.php';
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

try {
    $manager = new ImageManager(new Driver());
    echo "ImageManager initialized successfully.\n";
    
    // Create a dummy image
    $image = $manager->create(800, 600);
    echo "Image created successfully.\n";
    
    $base64Photo = base64_encode($image->toJpeg(70)->toString());
    echo "Image encoded successfully. Length: " . strlen($base64Photo) . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
