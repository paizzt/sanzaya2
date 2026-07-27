<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $users = DB::table('users')->get();

        foreach ($users as $user) {
            if (empty($user->password)) {
                continue;
            }

            try {
                // Check if the password is encrypted (Payload should be JSON for Crypt)
                // If it's already a bcrypt hash, it won't decrypt
                $decrypted = Crypt::decryptString($user->password);
                
                // If we get here, it was an encrypted string, so we hash the decrypted value
                DB::table('users')
                    ->where('id', $user->id)
                    ->update([
                        'password' => Hash::make($decrypted),
                        'require_password_change' => false
                    ]);
            } catch (\Exception $e) {
                // If it fails to decrypt, it might already be hashed, or unrecoverable.
                // If it's not a standard bcrypt hash (doesn't start with $2y$), we force a password change
                if (!str_starts_with($user->password, '$2y$')) {
                    DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'require_password_change' => true
                        ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reversing is not recommended, but we could theoretically re-encrypt. We leave it blank for safety.
    }
};
