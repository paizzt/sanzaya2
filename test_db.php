<?php
try { 
    App\Models\MarketingDailyReport::create([
        'user_id' => 1, 
        'visit_date' => '2026-10-01', 
        'visit_time' => '10:00:00', 
        'photos' => 'https://i.ibb.co/test.jpg'
    ]); 
    echo "Success\n"; 
} catch (\Exception $e) { 
    echo "Error: " . $e->getMessage() . "\n"; 
}
