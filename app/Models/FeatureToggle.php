<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class FeatureToggle extends Model
{
    protected $guarded = [];

    /**
     * Complete list of all menu & feature toggles in the application.
     */
    public static function allFeatureNames(): array
    {
        return [
            'Unduh PDF',
            'Dashboard',
            'Ambil Absensi',
            'Izin / Sakit',
            'Form Marketing',
            'Rekap Marketing',
            'Cari Produk',
            'Menu Pengajuan UC',
            'Riwayat UC',
            'Menu Persetujuan UC',
            'Menu Pengajuan BHP',
            'Rekap BHP',
            'Menu Pengajuan Pembayaran',
            'Data Hutang',
            'Data Piutang',
            'Persetujuan Pembayaran',
            'Laporan Logistik',
            'Surat Pesanan',
            'Data Penyedia',
            'Data Produk',
            'Kebutuhan Barang',
            'Data Outlet',
            'Stok Gudang',
            'Laporan WBS',
            'Tombol WBS',
            'Data Armada',
            'Penggunaan Kendaraan',
            'Data Perusahaan',
            'Data Pengguna',
            'Manajemen Gaji',
            'Manajemen SOP',
            'Rekap Absensi',
            'Slip Gaji',
            'Pemetaan Outlet',
            'Lapor WBS',
            'Riwayat Laporan Saya',
            'Riwayat Perubahan',
            'Notifikasi',
            'Profil & Akun',
            'Data Laporan Tersinkronisasi',
            'Dashboard Laporan',
        ];
    }

    /**
     * Map lowercase feature name to required Spatie permissions.
     */
    public static function featurePermissionMap(): array
    {
        return [
            'ambil absensi' => ['view absensi', 'create absensi'],
            'izin / sakit' => ['view absensi', 'view pengajuan absensi', 'create pengajuan absensi'],
            'rekap absensi' => ['view absensi', 'view rekap absensi'],
            'form marketing' => ['view marketing', 'create marketing', 'view target marketing', 'create target marketing'],
            'rekap marketing' => ['view marketing', 'export marketing'],
            'cari produk' => ['view marketing'],
            'menu pengajuan uc' => ['view uc requests', 'create uc requests'],
            'riwayat uc' => ['view uc requests'],
            'menu persetujuan uc' => ['approve uc requests', 'view uc requests'],
            'menu pengajuan bhp' => ['view bhp requests', 'create bhp requests'],
            'rekap bhp' => ['approve bhp requests', 'view bhp requests'],
            'menu pengajuan pembayaran' => ['payment-request.view-own', 'payment-request.create', 'payment-request.update-own', 'payment-request.submit', 'payment-request.delete-draft'],
            'persetujuan pembayaran' => ['payment-request.view-all', 'payment-request.review'],
            'data hutang' => ['view payables'],
            'data piutang' => ['view receivables'],
            'laporan logistik' => ['view purchase orders'],
            'surat pesanan' => ['view purchase orders'],
            'data penyedia' => ['manage master data', 'view master data'],
            'data produk' => ['manage master data', 'view master data'],
            'kebutuhan barang' => ['manage master data', 'view master data'],
            'stok gudang' => ['manage master data', 'view master data'],
            'data outlet' => ['manage master data', 'view master data'],
            'pemetaan outlet' => ['manage master data', 'view master data'],
            'data armada' => ['manage master data', 'view master data'],
            'penggunaan kendaraan' => ['manage master data', 'view master data'],
            'data perusahaan' => ['manage company'],
            'data pengguna' => ['view users'],
            'manajemen gaji' => ['view salaries', 'view users', 'manage master data'],
            'manajemen sop' => ['manage master data', 'view master data'],
            'riwayat perubahan' => ['view activity log'],
            'data laporan tersinkronisasi' => ['manage spreadsheet sync'],
            'dashboard laporan' => ['view laporan finansial'],
        ];
    }

    /**
     * Normalize feature or permission string to lowercase alphanumeric for reliable matching.
     */
    public static function normalizeFeatureKey(string $name): string
    {
        return strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $name));
    }

    /**
     * Check if a feature toggle is enabled for a given user.
     */
    public static function userHasFeature($user, string $featureName): bool
    {
        if (!$user) {
            return false;
        }

        // Superadmin and Admin always have access
        if (method_exists($user, 'isSuperAdminUser') && $user->isSuperAdminUser()) {
            return true;
        }

        static $featuresCache = null;
        if ($featuresCache === null) {
            try {
                self::deduplicateFeatures();
                $featuresCache = self::all();
            } catch (\Throwable $e) {
                return true;
            }
        }

        $normTarget = self::normalizeFeatureKey($featureName);
        $userIdStr = (string)$user->id;

        $hasMatchingFeature = false;
        $isExplicitlyDisabled = false;

        foreach ($featuresCache as $feature) {
            if (self::normalizeFeatureKey($feature->name) === $normTarget) {
                $hasMatchingFeature = true;
                $disabledUsers = json_decode($feature->disabled_for_users, true) ?? [];
                $disabledUserIds = array_map('strval', (array)$disabledUsers);

                // If user is NOT in disabled list for this matching feature, user HAS this feature enabled!
                if (!in_array($userIdStr, $disabledUserIds, true)) {
                    return true;
                }
                $isExplicitlyDisabled = true;
            }
        }

        // Only return false if matching feature exists and explicitly disables this user
        if ($hasMatchingFeature && $isExplicitlyDisabled) {
            return false;
        }

        return true;
    }

    /**
     * Clean up and deduplicate duplicate feature toggle rows in database.
     */
    public static function deduplicateFeatures(): void
    {
        static $alreadyDeduplicated = false;
        if ($alreadyDeduplicated) {
            return;
        }
        $alreadyDeduplicated = true;

        try {
            if (!Schema::hasTable('feature_toggles')) {
                return;
            }

            $canonicalNames = [];
            foreach (self::allFeatureNames() as $canName) {
                $canonicalNames[self::normalizeFeatureKey($canName)] = $canName;
            }

            $all = self::all();
            $grouped = [];
            foreach ($all as $item) {
                $norm = self::normalizeFeatureKey($item->name);
                $grouped[$norm][] = $item;
            }

            foreach ($grouped as $norm => $items) {
                $primary = $items[0];
                if (isset($canonicalNames[$norm])) {
                    $primary->name = $canonicalNames[$norm];
                }
                $primary->is_active = true;

                if (count($items) > 1) {
                    $allDisabledLists = [];
                    foreach ($items as $it) {
                        $dis = json_decode($it->disabled_for_users, true) ?? [];
                        $allDisabledLists[] = array_map('strval', (array)$dis);
                    }

                    // User is disabled only if disabled across ALL duplicates
                    $mergedDisabled = !empty($allDisabledLists)
                        ? call_user_func_array('array_intersect', $allDisabledLists)
                        : [];

                    $primary->disabled_for_users = json_encode(array_values(array_unique($mergedDisabled)));
                    $primary->save();

                    for ($i = 1; $i < count($items); $i++) {
                        $items[$i]->delete();
                    }
                } else {
                    $primary->save();
                }
            }
        } catch (\Throwable $e) {}
    }

    /**
     * Inverted map: Spatie permission / Gate ability => array of normalized feature keys that grant it.
     */
    public static function permissionToFeaturesMap(): array
    {
        static $inverted = null;
        if ($inverted !== null) {
            return $inverted;
        }

        $inverted = [];
        foreach (self::featurePermissionMap() as $featureName => $permissions) {
            $normFeature = self::normalizeFeatureKey($featureName);
            foreach ($permissions as $perm) {
                $normPerm = strtolower(trim($perm));
                $inverted[$normPerm][] = $normFeature;
            }
        }
        return $inverted;
    }

    /**
     * Check if user has permission via any enabled feature toggle.
     */
    public static function userHasPermissionViaFeature($user, string $ability): bool
    {
        if (!$user) {
            return false;
        }

        $map = self::permissionToFeaturesMap();
        $normAbility = strtolower(trim($ability));

        if (!isset($map[$normAbility])) {
            return false;
        }

        foreach ($map[$normAbility] as $normFeature) {
            if (self::userHasFeature($user, $normFeature)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Ensure all menu/feature toggle rows exist in the database.
     */
    public static function ensureAllFeaturesExist(): void
    {
        try {
            if (!Schema::hasTable('feature_toggles')) {
                return;
            }
            self::deduplicateFeatures();
            $existing = self::pluck('name')
                ->map(fn($n) => self::normalizeFeatureKey((string)$n))
                ->toArray();

            foreach (self::allFeatureNames() as $name) {
                if (!in_array(self::normalizeFeatureKey($name), $existing, true)) {
                    self::create([
                        'name' => $name,
                        'is_active' => true,
                        'disabled_for_users' => json_encode([]),
                    ]);
                }
            }
        } catch (\Throwable $e) {}
    }
}
