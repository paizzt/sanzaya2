<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Division;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\PaymentApprovalThreshold;

class PaymentModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Divisions (Di-handle di MasterDataSeeder)

        // 2. Roles
        $financeRole = Role::firstOrCreate(['name' => 'FINANCE', 'guard_name' => 'web']);
        $superadminRole = Role::firstOrCreate(['name' => 'SUPERADMIN', 'guard_name' => 'web']);
        $manajemenRole = Role::firstOrCreate(['name' => 'MANAJEMEN', 'guard_name' => 'web']);
        $staffRole = Role::firstOrCreate(['name' => 'STAFF', 'guard_name' => 'web']);

        // 3. Permissions
        $permissions = [
            'payment-request.view-own',
            'payment-request.view-division',
            'payment-request.view-all',
            'payment-request.create',
            'payment-request.update-own',
            'payment-request.delete-draft',
            'payment-request.submit',
            'payment-request.review',
            'payment-request.approve-supervisor',
            'payment-request.verify-finance',
            'payment-request.approve-ga',
            'payment-request.approve-director',
            'payment-request.process-payment',
            'payment-request.export',
            'payment-request.manage-settings',
            'payment-request.view-audit-log',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 4. Assign permissions to roles
        $superadminRole->givePermissionTo(Permission::all());

        $staffRole->syncPermissions([
            'payment-request.view-own',
            'payment-request.create',
            'payment-request.update-own',
            'payment-request.delete-draft',
            'payment-request.submit',
        ]);

        $manajemenRole->syncPermissions([
            'payment-request.view-own',
            'payment-request.create',
            'payment-request.update-own',
            'payment-request.delete-draft',
            'payment-request.submit',
            'payment-request.view-division',
            'payment-request.review',
            'payment-request.approve-supervisor',
        ]);

        $financeRole->syncPermissions([
            'payment-request.view-all',
            'payment-request.verify-finance',
            'payment-request.process-payment',
            'payment-request.export',
            'payment-request.approve-ga',
        ]);

        // 5. Thresholds
        if (PaymentApprovalThreshold::count() == 0) {
            PaymentApprovalThreshold::create([
                'name' => 'Finance',
                'minimum_amount' => 0,
                'maximum_amount' => 9999999.99,
                'required_role' => 'FINANCE',
                'approval_order' => 1,
            ]);

            PaymentApprovalThreshold::create([
                'name' => 'Manajemen',
                'minimum_amount' => 10000000,
                'maximum_amount' => 49999999.99,
                'required_role' => 'MANAJEMEN',
                'approval_order' => 2,
            ]);

            PaymentApprovalThreshold::create([
                'name' => 'Direktur / Superadmin',
                'minimum_amount' => 50000000,
                'maximum_amount' => null,
                'required_role' => 'SUPERADMIN',
                'approval_order' => 3,
            ]);
        }
    }
}
