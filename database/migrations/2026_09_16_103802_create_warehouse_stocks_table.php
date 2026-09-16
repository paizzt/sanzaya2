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
        Schema::create('warehouse_stocks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('category')->nullable();
            $table->integer('quantity')->default(0);
            $table->string('unit')->nullable();
            $table->integer('minimum_stock')->default(0);
            $table->string('location')->nullable();
            $table->text('notes')->nullable();
            $table->string('link')->nullable(); // Ditambahkan berdasarkan permintaan user
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('warehouse_stocks');
    }
};
