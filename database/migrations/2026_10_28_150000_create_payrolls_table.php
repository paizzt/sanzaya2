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
        if (!Schema::hasTable('payrolls')) {
            Schema::create('payrolls', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('company_id')->nullable()->constrained('companies')->nullOnDelete();
                $table->integer('period_month'); // 1 - 12
                $table->integer('period_year');  // e.g. 2026
                $table->date('payment_date')->nullable();
                $table->string('status', 50)->default('published'); // draft, published, paid

                // Penerimaan
                $table->decimal('gaji_pokok', 15, 2)->default(0);
                $table->decimal('operasional', 15, 2)->default(0);
                $table->decimal('tunjangan_jabatan', 15, 2)->default(0);
                $table->decimal('thr', 15, 2)->default(0);
                $table->decimal('lembur', 15, 2)->default(0);
                $table->decimal('total_penerimaan', 15, 2)->default(0);

                // Potongan
                $table->decimal('bpjs_kesehatan_persen', 5, 2)->default(1.00);
                $table->decimal('bpjs_kesehatan', 15, 2)->default(0);
                $table->decimal('bpjs_ketenagakerjaan_persen', 5, 2)->default(2.00);
                $table->decimal('bpjs_ketenagakerjaan', 15, 2)->default(0);
                $table->decimal('pajak', 15, 2)->default(0);
                $table->decimal('piutang', 15, 2)->default(0);
                $table->decimal('potongan_absen', 15, 2)->default(0);
                $table->decimal('potongan_lainnya', 15, 2)->default(0);
                $table->decimal('total_potongan', 15, 2)->default(0);

                // BPJS Perusahaan
                $table->decimal('bpjs_kesehatan_perusahaan_persen', 5, 2)->default(4.00);
                $table->decimal('bpjs_kesehatan_perusahaan', 15, 2)->default(0);
                $table->decimal('bpjs_ketenagakerjaan_perusahaan_persen', 5, 2)->default(4.24);
                $table->decimal('bpjs_ketenagakerjaan_perusahaan', 15, 2)->default(0);
                $table->decimal('total_bpjs_perusahaan', 15, 2)->default(0);

                // Total Diterima (Take Home Pay)
                $table->decimal('total_diterima', 15, 2)->default(0);

                $table->text('notes')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->unique(['user_id', 'period_month', 'period_year']);
                $table->index(['period_year', 'period_month']);
                $table->index('company_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payrolls');
    }
};
