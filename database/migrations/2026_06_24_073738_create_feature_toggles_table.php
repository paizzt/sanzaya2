<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('feature_toggles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->json('disabled_for_users')->nullable();
            $table->json('disabled_for_roles')->nullable();
            $table->json('disabled_for_divisions')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('feature_toggles'); }
};
