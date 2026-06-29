<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Crypt;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::create(['name' => 'view absensi']);
        Permission::create(['name' => 'manage absensi']);
        Permission::create(['name' => 'manage users']);

        // create roles and assign created permissions
        $roleSuperadmin = Role::create(['name' => 'Superadmin']);
        $roleSuperadmin->givePermissionTo(Permission::all());

        $roleHR = Role::create(['name' => 'HR']);
        $roleHR->givePermissionTo(['view absensi', 'manage absensi']);

        $roleSales = Role::create(['name' => 'Sales']);
        $roleSales->givePermissionTo(['view absensi']);

        // create superadmin user
        $user = User::create([
            'name' => 'Superadmin',
            'email' => 'staff@sanzaya.com',
            'password' => 'password123', // This will trigger the setPasswordAttribute mutator in User model and encrypt it with AES-256
            'is_active' => true,
        ]);
        
        $user->assignRole('Superadmin');
    }
}
