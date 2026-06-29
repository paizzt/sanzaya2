use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

// Roles
$roles = ['Admin', 'Manager', 'Direktur'];
foreach($roles as $r) {
    Role::firstOrCreate(['name' => $r]);
}

$users = [
    [
        'name' => 'Admin',
        'email' => 'admin@sanzaya.local',
        'role' => 'Admin'
    ],
    [
        'name' => 'Manager',
        'email' => 'manager@sanzaya.local',
        'role' => 'Manager'
    ],
    [
        'name' => 'Direktur',
        'email' => 'direktur@sanzaya.local',
        'role' => 'Direktur'
    ],
    [
        'name' => 'Sales / Marketing',
        'email' => 'sales@sanzaya.local',
        'role' => 'Sales'
    ]
];

foreach ($users as $uData) {
    $user = User::firstOrCreate(
        ['email' => $uData['email']],
        [
            'name' => $uData['name'],
            'password' => 'password123',
            'is_active' => true
        ]
    );
    $user->assignRole($uData['role']);
}

// Update the staff@sanzaya.com to superadmin@sanzaya.local to match the txt file
$super = User::where('email', 'staff@sanzaya.com')->first();
if ($super) {
    $super->email = 'superadmin@sanzaya.local';
    $super->save();
}

echo "Accounts created successfully";
