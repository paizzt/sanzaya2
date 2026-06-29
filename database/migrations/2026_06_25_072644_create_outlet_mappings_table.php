<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('outlet_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('raw_name')->unique(); // Nama unik dari spreadsheet
            $table->foreignId('outlet_id')->constrained('outlets')->onDelete('cascade');
            $table->boolean('is_confirmed')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('outlet_mappings');
    }
};
