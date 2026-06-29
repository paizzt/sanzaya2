<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('attendance_requests', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->enum('type', ['Sakit', 'Izin', 'Izin Khusus']);
            $table->date('start_date');
            $table->date('end_date');
            $table->text('reason');
            $table->string('attachment')->nullable();
            $table->enum('status', ['Menunggu', 'Disetujui', 'Ditolak', 'Dibatalkan'])->default('Menunggu');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('attendance_requests'); }
};
