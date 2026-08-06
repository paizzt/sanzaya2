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
        Schema::table('products', function (Blueprint $table) {
            $table->string('registration_no')->nullable();
            $table->integer('qty')->default(0);
            $table->string('unit')->nullable();
            $table->decimal('tkdn', 5, 2)->nullable();
            $table->decimal('hna', 15, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['registration_no', 'qty', 'unit', 'tkdn', 'hna']);
        });
    }
};
