<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('morning_reminder_time')->default('08:00');
            $table->string('evening_reminder_time')->default('17:00');
            $table->string('marketing_report_time')->default('17:30');
            $table->string('days_active')->default('1,2,3,4,5'); // Mon-Fri
            $table->text('vapid_public_key')->nullable();
            $table->text('vapid_private_key')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('notification_settings'); }
};
