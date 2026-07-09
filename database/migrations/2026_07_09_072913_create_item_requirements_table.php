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
        Schema::create('item_requirements', function (Blueprint $table) {
            $table->id();
            $table->string('outlet_name');
            $table->string('month_year');
            $table->string('item_name');
            $table->string('unit')->nullable();
            $table->integer('quantity')->default(0);
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->integer('sent')->default(0);
            $table->integer('not_sent')->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->string('link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_requirements');
    }
};
