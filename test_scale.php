<?php
require 'vendor/autoload.php';
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

try {
    $manager = new ImageManager(new Driver());
    $image = $manager->create(800, 600);
    $image->scaleDown(width: 800);
    echo "scaleDown exists.\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} catch (\Error $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
