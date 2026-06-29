<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->date('date');
            
            // Check In
            $table->time('check_in_time')->nullable();
            $table->string('check_in_photo')->nullable();
            $table->string('check_in_location')->nullable();
            $table->string('check_in_coordinates')->nullable();
            
            // Check Out
            $table->time('check_out_time')->nullable();
            $table->string('check_out_photo')->nullable();
            $table->string('check_out_location')->nullable();
            $table->string('check_out_coordinates')->nullable();
            
            $table->enum('status', ['Hadir', 'Sakit', 'Izin', 'Terlambat', 'Absen'])->default('Hadir');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('attendances'); }
};
