<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'check_in_notes')) {
                $table->text('check_in_notes')->nullable()->after('notes');
            }
            if (!Schema::hasColumn('attendances', 'check_out_notes')) {
                $table->text('check_out_notes')->nullable()->after('check_in_notes');
            }
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'check_out_notes')) {
                $table->dropColumn('check_out_notes');
            }
            if (Schema::hasColumn('attendances', 'check_in_notes')) {
                $table->dropColumn('check_in_notes');
            }
        });
    }
};
