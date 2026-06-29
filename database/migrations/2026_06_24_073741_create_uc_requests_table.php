<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('uc_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->unsignedBigInteger('user_id');
            $table->string('entity')->nullable(); // PT. Sanzaya Medika Pratama, dll
            $table->string('departure_city')->nullable();
            $table->string('destination_city')->nullable();
            $table->date('departure_date')->nullable();
            $table->date('return_date')->nullable();
            $table->integer('estimated_days')->default(0);
            $table->json('companions')->nullable();
            $table->string('transport_type')->nullable(); // Darat, Laut, Udara
            $table->string('vehicle_number')->nullable();
            $table->decimal('estimated_gas_cost', 15, 2)->nullable();
            
            // Result UC fields
            $table->text('result_report')->nullable();
            $table->json('result_receipts')->nullable();

            $table->enum('status', ['Menunggu', 'Disetujui', 'Ditolak', 'Dicairkan', 'Batal'])->default('Menunggu');
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('uc_requests'); }
};
