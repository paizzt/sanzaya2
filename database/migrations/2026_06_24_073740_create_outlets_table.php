<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('outlets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('city')->nullable(); // Kota/Kabupaten
            $table->string('type')->nullable(); // Apotek, Klinik, RS, dll
            $table->string('status')->nullable(); // Aktif, Prospek, dll
            $table->string('phone')->nullable();
            $table->string('pic_name')->nullable();
            $table->string('pic_position')->nullable();
            $table->text('address')->nullable();
            $table->unsignedBigInteger('marketing_area_id')->nullable();
            $table->string('coordinates')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('outlets'); }
};
