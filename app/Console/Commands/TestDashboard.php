<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\Request;

class TestDashboard extends Command
{
    protected $signature = 'test:dashboard';

    public function handle()
    {
        $user = User::first();
        Auth::login($user);

        try {
            $controller = new DashboardController();
            $response = $controller->index();
            $this->info('Dashboard loaded successfully.');
            $data = $response->toResponse(request())->getData();
            json_encode($data);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->error('JSON Error: ' . json_last_error_msg());
            } else {
                $this->info('JSON serialization successful.');
            }
        } catch (\Exception $e) {
            $this->error('Exception: ' . $e->getMessage());
            $this->error('File: ' . $e->getFile() . ':' . $e->getLine());
        }
    }
}
