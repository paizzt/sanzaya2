<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // User & Roles
            'view users', 'create users', 'update users', 'delete users', 'export users',
            'view roles', 'create roles', 'update roles', 'delete roles',
            
            // Absensi
            'view absensi', 'create absensi', 'update absensi', 'delete absensi', 'export absensi',
            'view rekap absensi', 'export rekap absensi',
            
            // Pengajuan Izin/Sakit (Cuti)
            'view pengajuan absensi', 'create pengajuan absensi', 'update pengajuan absensi', 'delete pengajuan absensi', 'approve pengajuan absensi', 'reject pengajuan absensi',
            
            // Marketing
            'view marketing', 'create marketing', 'update marketing', 'delete marketing', 'export marketing',
            'view target marketing', 'create target marketing', 'update target marketing',
            
            // UC Requests
            'view uc requests', 'create uc requests', 'update uc requests', 'delete uc requests', 'export uc requests',
            'approve uc requests', 'reject uc requests',
            
            // BHP Requests
            'view bhp requests', 'create bhp requests', 'update bhp requests', 'delete bhp requests', 'export bhp requests',
            'approve bhp requests', 'reject bhp requests',
            
            // Finansial
            'view purchase orders', 'create purchase orders', 'update purchase orders', 'delete purchase orders', 'export purchase orders',
            'view payables', 'create payables', 'update payables', 'delete payables', 'export payables',
            'view receivables', 'create receivables', 'update receivables', 'delete receivables', 'export receivables',
            'view laporan finansial', 'export laporan finansial',
            
            // Master Data
            'manage master data', 'view master data', 'export master data',
            
            // Pengaturan
            'manage settings', 'view activity log', 'manage company',
            
            // Spreadsheet
            'manage spreadsheet sync'
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // create roles and assign created permissions
        $roleSuperadmin = Role::firstOrCreate(['name' => 'SUPERADMIN']);
        $roleSuperadmin->syncPermissions(Permission::all());

        $roleHR = Role::firstOrCreate(['name' => 'MANAJEMEN']);
        $roleHR->syncPermissions([
            'view users', 'create users', 'update users',
            'view absensi', 'create absensi', 'update absensi', 'export absensi',
            'view rekap absensi', 'export rekap absensi',
            'view pengajuan absensi', 'approve pengajuan absensi', 'reject pengajuan absensi',
        ]);

        $roleSales = Role::firstOrCreate(['name' => 'MARKETING']);
        $roleSales->syncPermissions([
            'view absensi', 'create absensi',
            'view pengajuan absensi', 'create pengajuan absensi',
            'view marketing', 'create marketing',
            'view target marketing',
        ]);

        // create superadmin user
        $user = User::firstOrCreate(
            ['email' => 'staff@sanzaya.com'],
            [
                'name' => 'Superadmin',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'is_active' => true,
            ]
        );
        
        $user->assignRole('SUPERADMIN');
    }
}
