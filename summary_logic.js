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
        console.error('Error in data summarization:', e);
    }
