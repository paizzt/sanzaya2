<?php
use App\Models\User;
use App\Models\Division;

$newDivisions = ['LOGISTIK', 'FINANCE', 'MANAJEMEN', 'MARKETING', 'SUPERADMIN', 'STAFF'];
foreach($newDivisions as $d) {
    Division::firstOrCreate(['name' => $d]);
}

$divLogistik = Division::where('name', 'LOGISTIK')->first();
$divFinance = Division::where('name', 'FINANCE')->first();
$divManajemen = Division::where('name', 'MANAJEMEN')->first();
$divMarketing = Division::where('name', 'MARKETING')->first();

$users = User::with('division')->get();
foreach($users as $user) {
    if ($user->division) {
        $oldName = strtolower($user->division->name);
        if (in_array($oldName, ['logistik', 'purchasing'])) {
            $user->division_id = $divLogistik->id;
        } elseif (in_array($oldName, ['finance', 'tax', 'admin fakturis'])) {
            $user->division_id = $divFinance->id;
        } elseif (in_array($oldName, ['management', 'hrga', 'pjt', 'interior'])) {
            $user->division_id = $divManajemen->id;
        } elseif (in_array($oldName, ['marketing'])) {
            $user->division_id = $divMarketing->id;
        }
        $user->save();
    }
}

$oldDivisions = ['Finance', 'Logistik', 'Management', 'Purchasing', 'Marketing', 'HRGA', 'Admin Fakturis', 'Tax', 'PJT', 'Interior'];
Division::whereIn('name', $oldDivisions)->delete();

echo "Divisions cleaned up!\n";
