const ALIAS_GROUPS = {
    sanzaya: {
        tokens: ['sanzaya', 'sanzayamedikapratama'],
        exactTokens: ['smp'],
        staticLogo: '/img/company/sanzaya.png',
        secondaryLogo: '/img/logo.png',
        defaultAddress:
            'Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala,\nKota Makassar, Sulawesi Selatan 90235\nTelp/WA: +6281264304010 | Email: admin@Sanzaya.id',
    },
    harkes: {
        tokens: ['harkes', 'hartatahta', 'hartatahtakesehatan', 'harapankesehatan'],
        exactTokens: ['htk'],
        staticLogo: '/img/company/harkes.png',
        secondaryLogo: null,
        defaultAddress: '',
    },
    meraki: {
        tokens: ['meraki', 'merakimedso', 'merakimedsodistrindo'],
        exactTokens: ['mmd'],
        staticLogo: '/img/company/meraki.png',
        secondaryLogo: null,
        defaultAddress: '',
    },
    msi: {
        tokens: ['medicalsolution', 'medicalsolutionindonesia', 'multisentosa', 'multisentosaindonesia'],
        exactTokens: ['msi'],
        staticLogo: '/img/company/msi.png',
        secondaryLogo: null,
        defaultAddress: 'Jl. Taman Makam Pahlawan, Makassar, Indonesia.',
    },
    ruma: {
        tokens: ['ruma', 'rumautama', 'rumautamamegatrading'],
        exactTokens: [],
        staticLogo: '/img/company/ruma.png',
        secondaryLogo: null,
        defaultAddress: '',
    },
};

export const normalizeCompanyName = (name) =>
    String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

export const stripLegalPrefix = (name) => {
    const trimmed = String(name || '').trim();
    const withoutPrefix = trimmed.replace(/^(pt|cv|ud|fa|yayasan|koperasi|perum)\.?\s+/i, '');
    return normalizeCompanyName(withoutPrefix);
};

export const detectCompanyAliasKey = (name) => {
    const raw = String(name || '').trim();
    if (!raw) return null;

    const core = stripLegalPrefix(raw);
    const lower = raw.toLowerCase();

    for (const [key, cfg] of Object.entries(ALIAS_GROUPS)) {
        for (const token of cfg.tokens) {
            if (core && core.includes(token)) {
                return key;
            }
        }
        for (const exactToken of cfg.exactTokens) {
            const wordRe = new RegExp(`\\b${exactToken}\\b`, 'i');
            if (core === exactToken || wordRe.test(lower)) {
                return key;
            }
        }
    }

    return null;
};

export const findMatchingCompany = (entityName, companies = []) => {
    const entityTrim = String(entityName || '').trim();
    if (!entityTrim || !Array.isArray(companies) || companies.length === 0) {
        return null;
    }

    const entityLower = entityTrim.toLowerCase();
    const entityNorm = normalizeCompanyName(entityTrim);
    const entityCore = stripLegalPrefix(entityTrim);

    // Tier 1: Exact case-insensitive trimmed match
    const exactRaw = companies.find((c) => String(c?.name || '').trim().toLowerCase() === entityLower);
    if (exactRaw) return exactRaw;

    // Tier 2: Exact normalized match (with or without PT/CV prefix)
    const exactNorm = companies.find((c) => {
        const cNorm = normalizeCompanyName(c?.name);
        const cCore = stripLegalPrefix(c?.name);
        return (entityNorm && cNorm === entityNorm) || (entityCore && cCore === entityCore);
    });
    if (exactNorm) return exactNorm;

    // Tier 3: Canonical alias group match (e.g. "PT. MSI" <-> "PT. Medical Solution Indonesia")
    const entityAlias = detectCompanyAliasKey(entityTrim);
    if (entityAlias) {
        const aliasMatch = companies.find((c) => detectCompanyAliasKey(c?.name) === entityAlias);
        if (aliasMatch) return aliasMatch;
    }

    // Tier 4: Best substring match on prefix-stripped core name (never matching empty or generic "pt")
    if (entityCore.length >= 3) {
        let bestMatch = null;
        let bestScore = Infinity;
        for (const c of companies) {
            const cCore = stripLegalPrefix(c?.name);
            if (cCore.length < 3) continue;
            if (entityCore.includes(cCore) || cCore.includes(entityCore)) {
                const diff = Math.abs(entityCore.length - cCore.length);
                if (diff < bestScore) {
                    bestScore = diff;
                    bestMatch = c;
                }
            }
        }
        if (bestMatch) return bestMatch;
    }

    return null;
};

export const resolveUcCompanyInfo = (entityName, companies = []) => {
    const found = findMatchingCompany(entityName, companies);
    const resolvedName = (found?.name && String(found.name).trim())
        ? String(found.name).trim()
        : (String(entityName || '').trim() || 'PT. SANZAYA MEDIKA PRATAMA');

    const aliasKey = detectCompanyAliasKey(found?.name || entityName);
    const aliasCfg = aliasKey ? ALIAS_GROUPS[aliasKey] : null;
    const aliasStaticLogo = aliasCfg?.staticLogo || null;
    const aliasSecondaryLogo = aliasCfg?.secondaryLogo || null;

    let logo = null;
    let fallbackLogo = null;

    if (found?.logo_url) {
        logo = found.logo_url;
        fallbackLogo = found.fallback_logo_url || aliasStaticLogo || aliasSecondaryLogo || null;
    } else if (found?.logo) {
        const rawLogo = String(found.logo).trim();
        if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('/')) {
            logo = rawLogo;
        } else {
            const cleanRel = rawLogo.replace(/^storage\//i, '');
            logo = `/storage/${cleanRel}`;
        }
        fallbackLogo = aliasStaticLogo || aliasSecondaryLogo || null;
    } else if (aliasStaticLogo) {
        logo = aliasStaticLogo;
        fallbackLogo = aliasSecondaryLogo || null;
    }

    if (fallbackLogo === logo) {
        fallbackLogo = aliasSecondaryLogo && aliasSecondaryLogo !== logo ? aliasSecondaryLogo : null;
    }

    let address = '';
    if (found?.address && String(found.address).trim()) {
        address = String(found.address).trim();
    } else if (aliasCfg?.defaultAddress) {
        address = aliasCfg.defaultAddress;
    }

    return {
        company: found,
        name: resolvedName,
        logo,
        fallbackLogo,
        address,
    };
};

export const getDefaultUcEntity = (companies = []) => {
    if (Array.isArray(companies) && companies.length > 0) {
        const sanzaya = companies.find((c) => detectCompanyAliasKey(c?.name) === 'sanzaya');
        if (sanzaya?.name) return sanzaya.name;
        if (companies[0]?.name) return companies[0].name;
    }
    return 'PT. Sanzaya Medika Pratama';
};

export const buildCompanySelectOptions = (companies = [], currentEntity = '') => {
    const options = Array.isArray(companies) && companies.length > 0
        ? companies
            .filter((c) => c && c.name && String(c.name).trim() !== '')
            .map((c) => ({
                value: c.name,
                label: c.name,
            }))
        : [
            { value: 'PT. Sanzaya Medika Pratama', label: 'PT. Sanzaya Medika Pratama' },
            { value: 'PT. Harta Tahta Kesehatan', label: 'PT. Harta Tahta Kesehatan' },
            { value: 'CV. Meraki Medso Distrindo', label: 'CV. Meraki Medso Distrindo' },
            { value: 'PT. Medical Solution Indonesia', label: 'PT. Medical Solution Indonesia' },
            { value: 'PT. Ruma Utama Megatrading', label: 'PT. Ruma Utama Megatrading' },
        ];

    const trimmed = String(currentEntity || '').trim();
    if (trimmed && !options.some((opt) => opt.value.trim().toLowerCase() === trimmed.toLowerCase())) {
        const matched = findMatchingCompany(trimmed, companies);
        if (!matched) {
            options.unshift({ value: trimmed, label: trimmed });
        }
    }

    return options;
};
