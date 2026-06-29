<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('spreadsheet_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('type')->default('logistik');
            $table->string('spreadsheet_id')->nullable();
            $table->json('sheets_config')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('spreadsheet_configurations'); }
};
