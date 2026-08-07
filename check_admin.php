<?php
echo json_encode(\Spatie\Permission\Models\Role::findByName('Admin')->permissions->pluck('name'));
