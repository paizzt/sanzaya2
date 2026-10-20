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
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'shift')) {
                $table->string('shift', 50)->nullable()->after('status');
            }
        });

        try {
            $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'SATPAM', 'guard_name' => 'web']);
            $permissions = ['view absensi', 'create absensi', 'view rekap absensi', 'view pengajuan absensi', 'create pengajuan absensi'];
            foreach ($permissions as $perm) {
                $permissionModel = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
                if (!$role->hasPermissionTo($perm)) {
                    $role->givePermissionTo($permissionModel);
                }
            }
            \App\Models\Division::firstOrCreate(['name' => 'SATPAM']);
        } catch (\Throwable $e) {}
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (Schema::hasColumn('attendances', 'shift')) {
                $table->dropColumn('shift');
            }
        });
    }
};
