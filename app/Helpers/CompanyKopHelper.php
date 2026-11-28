<?php

namespace App\Helpers;

use App\Models\Company;
use Illuminate\Support\Collection;

class CompanyKopHelper
{
    /**
     * Canonical company alias groups mapping abbreviations and full official names.
     *
     * @var array<string, array{tokens: string[], exact_tokens: string[], static_logos: string[], default_address: string}>
     */
    private const ALIAS_GROUPS = [
        'sanzaya' => [
            'tokens' => ['sanzaya', 'sanzayamedikapratama'],
            'exact_tokens' => ['smp'],
            'static_logos' => ['img/company/sanzaya.png', 'img/logo.png'],
            'default_address' => "Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala,\nKota Makassar, Sulawesi Selatan 90235\nTelp/WA: +6281264304010 | Email: admin@Sanzaya.id",
        ],
        'harkes' => [
            'tokens' => ['harkes', 'hartatahta', 'hartatahtakesehatan', 'harapankesehatan'],
            'exact_tokens' => ['htk'],
            'static_logos' => ['img/company/harkes.png'],
            'default_address' => '',
        ],
        'meraki' => [
            'tokens' => ['meraki', 'merakimedso', 'merakimedsodistrindo'],
            'exact_tokens' => ['mmd'],
            'static_logos' => ['img/company/meraki.png'],
            'default_address' => '',
        ],
        'msi' => [
            'tokens' => ['medicalsolution', 'medicalsolutionindonesia', 'multisentosa', 'multisentosaindonesia'],
            'exact_tokens' => ['msi'],
            'static_logos' => ['img/company/msi.png'],
            'default_address' => 'Jl. Taman Makam Pahlawan, Makassar, Indonesia.',
        ],
        'ruma' => [
            'tokens' => ['ruma', 'rumautama', 'rumautamamegatrading'],
            'exact_tokens' => [],
            'static_logos' => ['img/company/ruma.png'],
            'default_address' => '',
        ],
    ];

    public static function normalize(?string $name): string
    {
        return strtolower(preg_replace('/[^a-z0-9]/i', '', (string) $name));
    }

    public static function stripLegalPrefix(?string $name): string
    {
        $trimmed = trim((string) $name);
        $withoutPrefix = preg_replace('/^(?:pt|cv|ud|fa|yayasan|koperasi|perum)(?:\.\s*|\s+)/i', '', $trimmed);
        return self::normalize($withoutPrefix);
    }

    public static function detectAliasKey(?string $name): ?string
    {
        $raw = trim((string) $name);
        if ($raw === '') {
            return null;
        }

        $core = self::stripLegalPrefix($raw);
        $lower = strtolower($raw);

        foreach (self::ALIAS_GROUPS as $key => $cfg) {
            foreach ($cfg['tokens'] as $token) {
                if ($core !== '' && str_contains($core, $token)) {
                    return $key;
                }
            }
            foreach ($cfg['exact_tokens'] as $exactToken) {
                if ($core === $exactToken || preg_match('/\b' . preg_quote($exactToken, '/') . '\b/i', $lower)) {
                    return $key;
                }
            }
        }

        return null;
    }

    /**
     * Find the best matching Company record for an entity name.
     *
     * @param  string|null  $entityName
     * @param  iterable<Company>|null  $companies
     */
    public static function findCompany(?string $entityName, $companies = null): ?Company
    {
        $entityTrim = trim((string) $entityName);
        if ($entityTrim === '') {
            return null;
        }

        $list = $companies instanceof Collection
            ? $companies
            : ($companies !== null ? collect($companies) : Company::select('id', 'name', 'logo', 'address')->get());

        if ($list->isEmpty()) {
            return null;
        }

        $entityLower = strtolower($entityTrim);
        $entityNorm = self::normalize($entityTrim);
        $entityCore = self::stripLegalPrefix($entityTrim);

        // Tier 1: Exact case-insensitive trimmed match
        foreach ($list as $c) {
            if (strtolower(trim((string) $c->name)) === $entityLower) {
                return $c;
            }
        }

        // Tier 2: Exact normalized match (with or without PT/CV prefix)
        foreach ($list as $c) {
            $cNorm = self::normalize($c->name);
            $cCore = self::stripLegalPrefix($c->name);
            if (($entityNorm !== '' && $cNorm === $entityNorm) || ($entityCore !== '' && $cCore === $entityCore)) {
                return $c;
            }
        }

        // Tier 3: Canonical alias group match (e.g. "PT. MSI" <-> "PT. Medical Solution Indonesia")
        $entityAlias = self::detectAliasKey($entityTrim);
        if ($entityAlias !== null) {
            foreach ($list as $c) {
                if (self::detectAliasKey($c->name) === $entityAlias) {
                    return $c;
                }
            }
        }

        // Tier 4: Best substring match on prefix-stripped core name (never matching empty or generic "pt")
        if (strlen($entityCore) >= 3) {
            $bestMatch = null;
            $bestScore = PHP_INT_MAX;
            foreach ($list as $c) {
                $cCore = self::stripLegalPrefix($c->name);
                if (strlen($cCore) < 3) {
                    continue;
                }
                if (str_contains($entityCore, $cCore) || str_contains($cCore, $entityCore)) {
                    $diff = abs(strlen($entityCore) - strlen($cCore));
                    if ($diff < $bestScore) {
                        $bestScore = $diff;
                        $bestMatch = $c;
                    }
                }
            }
            if ($bestMatch !== null) {
                return $bestMatch;
            }
        }

        return null;
    }

    /**
     * Resolve absolute filesystem path (or remote URL) for the company logo.
     * Strictly matches the selected company and never falls back to another company's logo.
     */
    public static function resolveLocalLogoPath(?Company $company, ?string $entityName = null): ?string
    {
        if ($company && !empty($company->logo)) {
            $rawLogo = trim((string) $company->logo);
            if (str_starts_with($rawLogo, 'http://') || str_starts_with($rawLogo, 'https://')) {
                return $rawLogo;
            }

            $rel = ltrim($rawLogo, '/\\');
            $relClean = preg_replace('#^(?:public/|storage/)#i', '', $rel);

            $candidates = [
                storage_path('app/public/' . $relClean),
                public_path('storage/' . $relClean),
                public_path('img/' . $relClean),
                public_path($rel),
            ];

            foreach ($candidates as $path) {
                if (!empty($path) && is_file($path)) {
                    return $path;
                }
            }
        }

        // Fallback to static logo asset ONLY for the same canonical company group
        $alias = self::detectAliasKey($company?->name ?: $entityName);
        if ($alias !== null && isset(self::ALIAS_GROUPS[$alias]['static_logos'])) {
            foreach (self::ALIAS_GROUPS[$alias]['static_logos'] as $staticRel) {
                $full = public_path($staticRel);
                if (is_file($full)) {
                    return $full;
                }
            }
        }

        return null;
    }

    /**
     * Resolve browser-accessible logo_url & fallback_logo_url for a company.
     *
     * @return array{logo_url: ?string, fallback_logo_url: ?string}
     */
    public static function resolvePublicLogoUrls(?Company $company, ?string $entityName = null): array
    {
        $alias = self::detectAliasKey($company?->name ?: $entityName);
        $aliasStaticUrl = null;
        if ($alias !== null && isset(self::ALIAS_GROUPS[$alias]['static_logos'])) {
            foreach (self::ALIAS_GROUPS[$alias]['static_logos'] as $staticRel) {
                if (is_file(public_path($staticRel))) {
                    $aliasStaticUrl = '/' . ltrim($staticRel, '/');
                    break;
                }
            }
        }

        if ($company && !empty($company->logo)) {
            $rawLogo = trim((string) $company->logo);
            if (str_starts_with($rawLogo, 'http://') || str_starts_with($rawLogo, 'https://')) {
                return [
                    'logo_url' => $rawLogo,
                    'fallback_logo_url' => $aliasStaticUrl,
                ];
            }

            $rel = ltrim($rawLogo, '/\\');
            $relClean = preg_replace('#^(?:public/|storage/)#i', '', $rel);
            $hasPublicStorage = is_file(public_path('storage/' . $relClean));
            $hasPublicImg = is_file(public_path('img/' . $relClean));
            $hasAppStorage = is_file(storage_path('app/public/' . $relClean));
            $logoVersion = substr(md5($rawLogo), 0, 10);
            $controllerUrl = $company->id ? route('company.logo', ['id' => $company->id, 'v' => $logoVersion]) : null;

            if ($hasPublicStorage) {
                return [
                    'logo_url' => '/storage/' . $relClean,
                    'fallback_logo_url' => $hasPublicImg ? ('/img/' . $relClean) : ($controllerUrl ?: $aliasStaticUrl),
                ];
            }

            if ($hasPublicImg) {
                return [
                    'logo_url' => '/img/' . $relClean,
                    'fallback_logo_url' => $controllerUrl ?: $aliasStaticUrl,
                ];
            }

            if ($hasAppStorage && $controllerUrl) {
                return [
                    'logo_url' => $controllerUrl,
                    'fallback_logo_url' => $aliasStaticUrl,
                ];
            }
        }

        return [
            'logo_url' => $aliasStaticUrl,
            'fallback_logo_url' => null,
        ];
    }

    /**
     * Resolve full Kop Surat details (name, address, logo) for an entity name.
     *
     * @param  string|null  $entityName
     * @param  iterable<Company>|null  $companies
     * @return array{company: ?Company, name: string, address: string, logo_path: ?string, logo_url: ?string, fallback_logo_url: ?string}
     */
    public static function resolveKop(?string $entityName, $companies = null): array
    {
        $company = self::findCompany($entityName, $companies);
        $alias = self::detectAliasKey($company?->name ?: $entityName);

        $name = ($company && !empty(trim((string) $company->name)))
            ? trim((string) $company->name)
            : (trim((string) $entityName) ?: 'PT. SANZAYA MEDIKA PRATAMA');

        $address = ($company && !empty(trim((string) $company->address)))
            ? trim((string) $company->address)
            : ($alias !== null ? (self::ALIAS_GROUPS[$alias]['default_address'] ?? '') : '');

        $logoPath = self::resolveLocalLogoPath($company, $entityName);
        $urls = self::resolvePublicLogoUrls($company, $entityName);

        return [
            'company' => $company,
            'name' => $name,
            'address' => $address,
            'logo_path' => $logoPath,
            'logo_url' => $urls['logo_url'],
            'fallback_logo_url' => $urls['fallback_logo_url'],
        ];
    }

    /**
     * Format companies collection with pre-resolved browser logo URLs for Inertia pages.
     *
     * @param  iterable<Company>|null  $companies
     * @return array<int, array<string, mixed>>
     */
    public static function formatCompaniesForFrontend($companies = null): array
    {
        $list = $companies !== null
            ? collect($companies)
            : Company::select('id', 'name', 'logo', 'address')->orderBy('id')->get();

        return $list->map(function (Company $c) {
            $urls = self::resolvePublicLogoUrls($c, $c->name);
            return [
                'id' => $c->id,
                'name' => $c->name,
                'logo' => $c->logo,
                'address' => $c->address,
                'logo_url' => $urls['logo_url'],
                'fallback_logo_url' => $urls['fallback_logo_url'],
            ];
        })->values()->all();
    }
}
