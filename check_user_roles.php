<?php
foreach(App\Models\User::all() as $u) {
    echo $u->name . ' -> ' . $u->getRoleNames()->join(', ') . "\n";
}
