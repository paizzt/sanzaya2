<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('marketing_weekly_targets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->integer('week_number');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('target_visits')->default(0);
            $table->integer('target_new_outlets')->default(0);
            $table->decimal('target_transactions', 15, 2)->default(0);
            $table->text('strategy')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('marketing_weekly_targets'); }
};
