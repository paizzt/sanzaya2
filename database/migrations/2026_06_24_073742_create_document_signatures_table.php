<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('document_signatures', function (Blueprint $table) {
            $table->id();
            $table->morphs('documentable'); // e.g., UcRequest or BhpRequest
            $table->unsignedBigInteger('signed_by');
            $table->string('barcode_token')->unique();
            $table->string('pdf_path')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('document_signatures'); }
};
