<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Using Reflection to call private method
$controller = new App\Http\Controllers\UserController();
$reflection = new ReflectionClass(get_class($controller));
$method = $reflection->getMethod('syncFeatureToggles');
$method->setAccessible(true);

$method->invokeArgs($controller, [1, []]); // Disable all features for user 1

echo "Feature 1 disabled for users: " . App\Models\FeatureToggle::find(1)->disabled_for_users . "\n";
