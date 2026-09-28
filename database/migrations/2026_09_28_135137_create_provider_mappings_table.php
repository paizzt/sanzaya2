<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('provider_mappings', function (Blueprint $table) {
            $table->id();
            $table->string('raw_name')->unique();
            $table->foreignId('provider_id')->constrained('providers')->onDelete('cascade');
            $table->boolean('is_confirmed')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('provider_mappings');
    }
};
