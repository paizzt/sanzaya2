<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->string('letter_number')->nullable()->after('reference_number');
        });
    }

    public function down()
    {
        Schema::table('payment_requests', function (Blueprint $table) {
            $table->dropColumn('letter_number');
        });
    }
};
