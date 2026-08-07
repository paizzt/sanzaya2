<?php
$users = \App\Models\User::all();
foreach($users as $u) {
    echo $u->email . ' : ' . $u->roles->pluck('name')->join(', ') . PHP_EOL;
}
