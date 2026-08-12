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
        Schema::create('uc_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('uc_request_id')->constrained('uc_requests')->onDelete('cascade');
            $table->string('item_name');
            $table->integer('quantity');
            $table->decimal('estimated_cost', 15, 2);
            $table->decimal('total_cost', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uc_request_items');
    }
};
