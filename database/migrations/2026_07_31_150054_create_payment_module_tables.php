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
        // 1. Thresholds
        Schema::create('payment_approval_thresholds', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('minimum_amount', 20, 2)->default(0);
            $table->decimal('maximum_amount', 20, 2)->nullable(); // null means unlimited
            $table->string('required_role');
            $table->integer('approval_order');
            $table->boolean('is_active')->default(true);
            $table->date('effective_from')->nullable();
            $table->date('effective_until')->nullable();
            $table->timestamps();
        });

        // 2. Payment Requests
        Schema::create('payment_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->string('company_name')->default('PT Sanzaya Medika Pratama');
            $table->foreignId('requester_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('division_id')->constrained('divisions')->onDelete('restrict');
            $table->date('submission_date')->nullable();
            $table->date('payment_deadline');
            $table->date('transaction_date');
            $table->string('category');
            $table->text('purpose');
            $table->string('recipient_name');
            $table->foreignId('vendor_id')->nullable()->constrained('providers')->nullOnDelete();
            $table->string('invoice_reference')->nullable();
            $table->string('project_or_outlet');
            
            // Perhitungan
            $table->decimal('subtotal', 20, 2)->default(0);
            $table->decimal('discount', 20, 2)->default(0);
            $table->decimal('other_cost', 20, 2)->default(0);
            $table->enum('vat_status', ['Sudah Termasuk', 'Belum Termasuk', 'Tidak Dikenakan'])->default('Tidak Dikenakan');
            $table->decimal('vat_rate', 5, 2)->default(0);
            $table->decimal('vat_amount', 20, 2)->default(0);
            $table->decimal('grand_total', 20, 2)->default(0);
            
            // Rekening & Pembayaran
            $table->string('payment_method');
            $table->string('bank_or_wallet')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_name')->nullable();
            $table->boolean('account_used_before')->default(false);
            $table->boolean('account_changed')->default(false);
            $table->text('account_change_note')->nullable();
            
            // Statuses
            $table->string('completeness_status')->default('incomplete'); // incomplete, complete
            $table->string('workflow_status')->default('draft');
            $table->string('current_approval_stage')->nullable();
            $table->string('current_approver_role')->nullable();
            
            // Timestamps
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('supervisor_approved_at')->nullable();
            $table->timestamp('finance_verified_at')->nullable();
            $table->timestamp('approved_for_payment_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            
            $table->timestamps();
            $table->softDeletes();
        });

        // 3. Payment Request Items
        Schema::create('payment_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->constrained()->cascadeOnDelete();
            $table->text('description');
            $table->integer('quantity');
            $table->string('unit')->nullable();
            $table->decimal('unit_price', 20, 2)->default(0);
            $table->decimal('amount', 20, 2)->default(0);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // 4. Attachments
        Schema::create('payment_request_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->constrained()->cascadeOnDelete();
            $table->string('attachment_type'); // invoice, rekening, tax, other
            $table->string('original_name');
            $table->string('stored_name');
            $table->string('file_path');
            $table->string('mime_type')->nullable();
            $table->integer('file_size')->nullable(); // in bytes
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // 5. Approvals
        Schema::create('payment_request_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->constrained()->cascadeOnDelete();
            $table->string('approval_stage');
            $table->foreignId('approver_id')->constrained('users')->onDelete('restrict');
            $table->string('approver_role')->nullable();
            $table->string('action'); // approved, rejected, returned
            $table->string('status_before')->nullable();
            $table->string('status_after')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('acted_at');
            $table->timestamps();
        });

        // 6. Finance Verifications
        Schema::create('payment_request_finance_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('verifier_id')->constrained('users')->onDelete('restrict');
            $table->boolean('account_verified')->default(false);
            $table->boolean('recipient_verified')->default(false);
            $table->boolean('amount_verified')->default(false);
            $table->boolean('vat_verified')->default(false);
            $table->boolean('deadline_verified')->default(false);
            $table->boolean('invoice_verified')->default(false);
            $table->boolean('tax_document_verified')->default(false);
            $table->boolean('account_change_confirmed')->default(false);
            $table->text('notes')->nullable();
            $table->timestamp('verified_at');
            $table->timestamps();
        });

        // 7. Payments
        Schema::create('payment_request_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_request_id')->constrained()->cascadeOnDelete();
            $table->date('payment_date');
            $table->decimal('paid_amount', 20, 2);
            $table->string('payment_method');
            $table->string('source_bank')->nullable();
            $table->string('transaction_reference')->nullable();
            $table->string('proof_file_path')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('processed_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment_module_tables');
    }
};
