<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('marketing_daily_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('outlet_id')->nullable();
            $table->date('visit_date');
            $table->time('visit_time');
            $table->string('visit_type')->nullable();
            $table->string('visit_result')->nullable();
            $table->text('summary')->nullable();
            $table->text('offered_products')->nullable();
            $table->text('interested_products')->nullable();
            $table->decimal('estimated_value', 15, 2)->nullable();
            $table->decimal('actual_value', 15, 2)->nullable();
            $table->text('follow_up_plan')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->string('issue_type')->nullable(); // Kendala
            $table->text('issue_description')->nullable();
            $table->text('competitor_notes')->nullable();
            $table->json('photos')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('marketing_daily_reports'); }
};
