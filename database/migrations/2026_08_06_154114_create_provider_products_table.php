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
        Schema::create('provider_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('provider_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code')->nullable();
            $table->string('registration_no')->nullable();
            $table->integer('qty')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('tkdn', 5, 2)->nullable();
            $table->decimal('hna', 15, 2)->nullable();
            $table->decimal('price', 15, 2);
            $table->text('description')->nullable();
            $table->string('jenis')->nullable();
            $table->string('link')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Migrate data from products to provider_products
        $productsToMove = \Illuminate\Support\Facades\DB::table('products')
            ->whereNotNull('provider_id')
            ->get();

        foreach ($productsToMove as $product) {
            \Illuminate\Support\Facades\DB::table('provider_products')->insert([
                'provider_id' => $product->provider_id,
                'name' => $product->name,
                'code' => $product->code,
                'registration_no' => $product->registration_no,
                'qty' => $product->qty,
                'unit' => $product->unit,
                'tkdn' => $product->tkdn,
                'hna' => $product->hna,
                'price' => $product->price,
                'description' => $product->description,
                'jenis' => $product->jenis,
                'link' => $product->link,
                'is_active' => $product->is_active,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]);
        }

        // Delete from products
        \Illuminate\Support\Facades\DB::table('products')->whereNotNull('provider_id')->delete();

        // Remove provider_id from products
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['provider_id']);
            $table->dropColumn('provider_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('provider_id')->nullable()->constrained()->nullOnDelete();
        });

        // Migrate back
        $providerProducts = \Illuminate\Support\Facades\DB::table('provider_products')->get();
        foreach ($providerProducts as $product) {
            \Illuminate\Support\Facades\DB::table('products')->insert([
                'provider_id' => $product->provider_id,
                'name' => $product->name,
                'code' => $product->code,
                'registration_no' => $product->registration_no,
                'qty' => $product->qty,
                'unit' => $product->unit,
                'tkdn' => $product->tkdn,
                'hna' => $product->hna,
                'price' => $product->price,
                'description' => $product->description,
                'jenis' => $product->jenis,
                'link' => $product->link,
                'is_active' => $product->is_active,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ]);
        }

        Schema::dropIfExists('provider_products');
    }
};
