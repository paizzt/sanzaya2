<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bhp_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->unsignedBigInteger('user_id');
            $table->date('request_date')->nullable();
            $table->string('division_name')->nullable();
            $table->date('target_date')->nullable();
            $table->string('product_name')->nullable();
            $table->text('specifications')->nullable();
            $table->enum('status', ['Menunggu', 'Disetujui', 'Ditolak', 'Diproses', 'Diserahkan', 'Batal'])->default('Menunggu');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('bhp_requests'); }
};
