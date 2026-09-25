import re

files = [
    r'resources\js\Pages\Receivables\Index.jsx',
    r'resources\js\Pages\Payables\Index.jsx'
]

replacement = '''
    let summaryByYear = {};
    let summaryByPT = {};
    let totalOutlets = 0;
    let totalPiutangKeseluruhan = 0;
    let yearEntries = [];
    let ptEntries = [];

    try {
        if (Array.isArray(items)) {
            summaryByYear = items.reduce((acc, item) => {
                const filteredDetails = getFilteredDetails(item.details);
                if (Array.isArray(filteredDetails)) {
                    filteredDetails.forEach(d => {
                        if (d && d.year && d.year !== 'Total') {
                            acc[d.year] = (acc[d.year] || 0) + Number(d.amount || 0);
                        }
                    });
                }
                return acc;
            }, {});

            summaryByPT = items.reduce((acc, item) => {
                const companyName = item.company && item.company.name ? item.company.name : '-';
                if (companyName) {
                    acc[companyName] = (acc[companyName] || 0) + getFilteredTotal(item.details);
                }
                return acc;
            }, {});

            totalOutlets = new Set(items.map(item => item.outlet && item.outlet.name ? item.outlet.name : '').filter(Boolean)).size;
            totalPiutangKeseluruhan = items.reduce((sum, item) => sum + getFilteredTotal(item.details), 0);
        }

        const safeSummaryByYear = summaryByYear && typeof summaryByYear === 'object' ? summaryByYear : {};
        const safeSummaryByPT = summaryByPT && typeof summaryByPT === 'object' ? summaryByPT : {};

        yearEntries = Object.entries(safeSummaryByYear).sort(([a], [b]) => Number(b) - Number(a));
        ptEntries = Object.entries(safeSummaryByPT);
    } catch (e) {
        console.error("Error computing summaries:", e);
    }
'''

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace the JS logic part
    pattern = re.compile(r'const summaryByYear = items\.reduce.*?const totalPiutangKeseluruhan = items\.reduce[^\n]*\n', re.DOTALL)
    content = pattern.sub(replacement + '\n', content)
    
    # Replace the JSX parts for yearEntries
    jsx_year_pattern = re.compile(r'\{Object\.entries\(safeSummaryByYear\).*?\{Object\.keys\(summaryByYear \|\| \{\}\)\.length === 0 && <div className="text-sm text-blue-600/70">Tidak ada data</div>\}', re.DOTALL)
    jsx_year_replacement = '''
                                        {yearEntries.map(([year, amount]) => (
                                            <div key={year} className="flex justify-between items-start text-sm gap-2">
                                                <span className="text-blue-700">{year}</span>
                                                <span className="font-bold text-blue-900 whitespace-nowrap text-right">Rp {formatRupiah(amount)}</span>
                                            </div>
                                        ))}
                                        {yearEntries.length === 0 && <div className="text-sm text-blue-600/70">Tidak ada data</div>}
'''
    content = jsx_year_pattern.sub(jsx_year_replacement.strip(), content)
    
    # Replace the JSX parts for ptEntries
    jsx_pt_pattern = re.compile(r'\{Object\.entries\(safeSummaryByPT\).*?\{Object\.keys\(summaryByPT \|\| \{\}\)\.length === 0 && <div className="text-sm text-indigo-600/70">Tidak ada data</div>\}', re.DOTALL)
    jsx_pt_replacement = '''
                                        {ptEntries.map(([pt, amount]) => (
                                            <div key={pt} className="flex justify-between items-start text-sm gap-2 mt-1">
                                                <span className="text-indigo-700 leading-tight">{pt}</span>
                                                <span className="font-bold text-indigo-900 whitespace-nowrap text-right">Rp {formatRupiah(amount)}</span>
                                            </div>
                                        ))}
                                        {ptEntries.length === 0 && <div className="text-sm text-indigo-600/70">Tidak ada data</div>}
'''
    content = jsx_pt_pattern.sub(jsx_pt_replacement.strip(), content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
