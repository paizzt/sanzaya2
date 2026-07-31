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
        // 1. Divisions
        $divisions = ['Purchasing', 'Marketing', 'HRGA', 'Admin Fakturis', 'Tax', 'PJT', 'Interior'];
        foreach ($divisions as $division) {
            Division::firstOrCreate(['name' => $division]);
        }

        // 2. Role General Accounting
        $gaRole = Role::firstOrCreate(['name' => 'General Accounting', 'guard_name' => 'web']);
        $apRole = Role::firstOrCreate(['name' => 'Finance', 'guard_name' => 'web']); // Account Payable
        $directorRole = Role::firstOrCreate(['name' => 'Direktur', 'guard_name' => 'web']);
        $managerRole = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $superadminRole = Role::firstOrCreate(['name' => 'Superadmin', 'guard_name' => 'web']);
        $employeeRole = Role::firstOrCreate(['name' => 'Karyawan', 'guard_name' => 'web']);

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

        $employeeRole->syncPermissions([
            'payment-request.view-own',
            'payment-request.create',
            'payment-request.update-own',
            'payment-request.delete-draft',
            'payment-request.submit',
        ]);

        $managerRole->syncPermissions([
            'payment-request.view-own',
            'payment-request.create',
            'payment-request.update-own',
            'payment-request.delete-draft',
            'payment-request.submit',
            'payment-request.view-division',
            'payment-request.review',
            'payment-request.approve-supervisor',
        ]);

        $apRole->syncPermissions([
            'payment-request.view-all',
            'payment-request.verify-finance',
            'payment-request.process-payment',
            'payment-request.export',
        ]);

        $gaRole->syncPermissions([
            'payment-request.view-all',
            'payment-request.approve-ga',
            'payment-request.export',
        ]);

        $directorRole->syncPermissions([
            'payment-request.view-all',
            'payment-request.approve-director',
            'payment-request.export',
        ]);

        // 5. Thresholds
        if (PaymentApprovalThreshold::count() == 0) {
            PaymentApprovalThreshold::create([
                'name' => 'Finance / Account Payable',
                'minimum_amount' => 0,
                'maximum_amount' => 9999999.99,
                'required_role' => 'Finance',
                'approval_order' => 1,
            ]);

            PaymentApprovalThreshold::create([
                'name' => 'General Accounting',
                'minimum_amount' => 10000000,
                'maximum_amount' => 49999999.99,
                'required_role' => 'General Accounting',
                'approval_order' => 2,
            ]);

            PaymentApprovalThreshold::create([
                'name' => 'Direktur',
                'minimum_amount' => 50000000,
                'maximum_amount' => null,
                'required_role' => 'Direktur',
                'approval_order' => 3,
            ]);
        }
    }
}
