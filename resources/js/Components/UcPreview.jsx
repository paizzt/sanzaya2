import React from 'react';

export default function UcPreview({ data, user, companies = [] }) {
    const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const getCompanyInfo = (entityName) => {
        const clean = (entityName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        if (companies && companies.length > 0) {
            const found = companies.find(c => {
                const cClean = (c.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                return clean.includes(cClean) || cClean.includes(clean);
            });
            if (found) {
                return {
                    name: entityName || found.name,
                    logo: clean.includes('sanzaya') ? '/img/logo.png' : (found.logo ? `/storage/${found.logo}` : '/img/logo.png'),
                    address: found.address || ''
                };
            }
        }

        if (clean.includes('harkes')) {
            return {
                name: entityName || 'PT. Harkes',
                logo: '/storage/company/IUFdNWO9Qcih9qpBXkBDhjtMY46A4CsjVTbtrk0C.png',
                address: 'Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala, Kota Makassar, Sulawesi Selatan 90235'
            };
        }
        if (clean.includes('meraki')) {
            return {
                name: entityName || 'CV. Meraki',
                logo: '/storage/company/UodzfHxiO5KnXHR1cywPUQxASq6Wl2BA6r41YjxH.png',
                address: 'Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala, Kota Makassar, Sulawesi Selatan 90235'
            };
        }
        if (clean.includes('msi')) {
            return {
                name: entityName || 'PT. MSI',
                logo: '/storage/company/CFKdTemIfTZwzwOD2L2og2U5OyUc2LCdwO9kBPqH.png',
                address: 'Jl. Taman Makam Pahlawan, Makassar, Indonesia.'
            };
        }
        if (clean.includes('ruma')) {
            return {
                name: entityName || 'PT. Ruma',
                logo: '/storage/company/WHkbgcStg5nbv1RctprbOosfi9qsE2klGxgBD4n0.png',
                address: 'Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala, Kota Makassar, Sulawesi Selatan 90235'
            };
        }
        if (clean.includes('sanzaya')) {
            return {
                name: entityName || 'PT. Sanzaya Medika Pratama',
                logo: '/img/logo.png',
                address: 'Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala, Kota Makassar, Sulawesi Selatan 90235'
            };
        }

        return {
            name: entityName || 'PT. SANZAYA MEDIKA PRATAMA',
            logo: '/img/logo.png',
            address: 'Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala, Kota Makassar, Sulawesi Selatan 90235'
        };
    };

    const currentCompany = getCompanyInfo(data?.entity);

    const formatAddress = (addr) => {
        const defaultContact = 'Telp/WA: +6281264304010 | Email: admin@Sanzaya.id';
        if (!addr || !addr.trim()) {
            return {
                addressText: 'Alamat: Jl. Tamangapa Raya 3 No.47b, Bangkala, Kec. Manggala, Kota Makassar, Sulawesi Selatan 90235',
                contactText: defaultContact
            };
        }
        const text = addr.trim();
        const hasContact = text.toLowerCase().includes('telp') || text.toLowerCase().includes('email') || text.toLowerCase().includes('wa:');
        
        return {
            addressText: text.toLowerCase().startsWith('alamat') ? text : `Alamat: ${text}`,
            contactText: hasContact ? null : defaultContact
        };
    };

    const { addressText, contactText } = formatAddress(currentCompany.address);

    const items = data.items || [];
    const totalCost = items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const cost = parseFloat(item.estimated_cost) || 0;
        return sum + (qty * cost);
    }, 0);
    const panjarCost = totalCost / 2;

    let itemCounter = 1;

    const PageContainer = ({ children }) => (
        <div className="bg-white mx-auto shadow-md border border-gray-300 overflow-hidden text-black mb-8 relative font-sans leading-relaxed" 
             style={{ width: '100%', aspectRatio: '210/297', padding: '8% 10% 12% 10%' }}>
            
            {/* Footer Watermark */}
            <div className="absolute bottom-6 left-0 right-0 bg-[#799fbb] text-white italic font-bold py-2 px-10 text-[8px] sm:text-[10px] lg:text-xs text-left w-full h-8 flex items-center">
                Make a Different
            </div>

            <div className="h-full flex flex-col text-[7px] sm:text-[9px] lg:text-[11px] xl:text-xs">
                {children}
            </div>
        </div>
    );

    const SignatureBlock = () => (
        <table className="w-full text-center border-collapse border border-black mt-4">
            <thead>
                <tr>
                    <th className="border border-black p-1">Dibuat Oleh</th>
                    <th className="border border-black p-1">Diperiksa Oleh</th>
                    <th className="border border-black p-1">Disetujui Oleh</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border border-black p-2 h-12 lg:h-16 align-bottom">
                        <div className="font-bold underline">{user?.name || 'Staff Pegawai'}</div>
                    </td>
                    <td className="border border-black p-2 h-12 lg:h-16 align-bottom">
                        <div className="font-bold underline">Manajer</div>
                    </td>
                    <td className="border border-black p-2 h-12 lg:h-16 align-bottom">
                        <div className="font-bold underline">Finance</div>
                    </td>
                </tr>
                <tr>
                    <td className="border border-black text-[6px] sm:text-[8px] lg:text-[10px]">Staff</td>
                    <td className="border border-black text-[6px] sm:text-[8px] lg:text-[10px]">Manager</td>
                    <td className="border border-black text-[6px] sm:text-[8px] lg:text-[10px]">Finance</td>
                </tr>
            </tbody>
        </table>
    );

    const HeaderBlock = ({ title, showSignature = false }) => (
        <div className="flex flex-col mb-4">
            <div className="flex flex-col md:flex-row items-center justify-between border-b-2 border-indigo-900 pb-2 mb-4">
                <div className="mb-2 md:mb-0 w-1/3 flex items-center justify-start">
                    <img 
                        src={currentCompany.logo} 
                        alt={currentCompany.name} 
                        className="max-h-12 max-w-[140px] object-contain" 
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/img/logo.png';
                        }}
                    />
                </div>
                <div className="text-center w-2/3">
                    <h2 className="text-sm lg:text-base font-bold text-indigo-900 font-serif tracking-wide mb-1 uppercase">
                        {currentCompany.name}
                    </h2>
                    <p className="text-[8px] lg:text-[10px] text-gray-700 leading-tight whitespace-pre-line">
                        {addressText}
                        {contactText && (
                            <>
                                <br />
                                {contactText}
                            </>
                        )}
                    </p>
                </div>
            </div>
            
            <div className="flex justify-between items-start mt-2">
                <div className={showSignature ? "w-1/2" : "w-full"}>
                    <p className="font-bold text-xs lg:text-sm leading-tight mt-0">{title}</p>
                    <p className="font-bold text-sm lg:text-base leading-tight mt-0.5">UPCOUNTRY (UC)</p>
                </div>
                {showSignature && (
                    <div className="w-1/2 pl-4 flex justify-end">
                        <div className="w-full max-w-[220px] lg:max-w-[280px]">
                            <SignatureBlock />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="w-full h-full max-h-[85vh] overflow-y-auto custom-scrollbar pr-2">
            
            {/* PAGE 1: FORM PENGAJUAN */}
            <PageContainer>
                <HeaderBlock title="FORM PENGAJUAN BIAYA" showSignature={false} />

                <div className="text-right font-bold my-4">
                    Makassar, {formatDate(new Date().toISOString())}
                </div>

                <div className="mb-4 leading-normal text-justify">
                    Sehubungan dengan kebutuhan operasional guna memaksimalkan upaya pengembangan performa penjualan perusahaan, dengan ini kami mengajukan untuk melakukan perjalanan sebagai berikut:
                </div>

                <table className="w-full border-none">
                    <tbody>
                        <tr className="align-top">
                            <td className="py-1.5 w-[5%]">1.</td>
                            <td className="py-1.5 w-[30%]">Nama</td>
                            <td className="py-1.5 w-[2%]">:</td>
                            <td className="py-1.5 w-[63%]">{user?.name || '-'}</td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">2.</td>
                            <td className="py-1.5">Jabatan</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5">{user?.role || 'Staff'} - {data.department || 'Sales'}</td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">3.</td>
                            <td className="py-1.5">Tujuan</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5">{data.destination_city || '-'}</td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">4.</td>
                            <td className="py-1.5">Waktu (hari)</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5">
                                <div className="border border-black px-2 py-1 w-[90%]">{data.estimated_days || 0} Hari</div>
                            </td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">5.</td>
                            <td className="py-1.5">Tanggal Berangkat</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5">
                                <div className="border border-black px-2 py-1 w-[90%]">{formatDate(data.departure_date)}</div>
                            </td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">6.</td>
                            <td className="py-1.5">Tanggal Pulang</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5">
                                <div className="border border-black px-2 py-1 w-[90%]">{formatDate(data.return_date)}</div>
                            </td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">7.</td>
                            <td className="py-1.5">Nama & Jabatan<br/>Pendamping</td>
                            <td className="py-1.5">:<br/>&nbsp;</td>
                            <td className="py-1.5">
                                <div className="mb-1 flex items-center gap-1">
                                    <span>1.</span>
                                    <div className="border border-black px-2 py-1 flex-1">
                                        {data.companions && data.companions[0] 
                                            ? (typeof data.companions[0] === 'string' ? data.companions[0] : (data.companions[0].name || '-')) 
                                            : '-'}
                                        {data.companions && data.companions[0]?.position ? ` (${data.companions[0].position})` : ''}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>2.</span>
                                    <div className="border border-black px-2 py-1 flex-1">
                                        {data.companions && data.companions[1] 
                                            ? (typeof data.companions[1] === 'string' ? data.companions[1] : (data.companions[1].name || '-')) 
                                            : '-'}
                                        {data.companions && data.companions[1]?.position ? ` (${data.companions[1].position})` : ''}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">8.</td>
                            <td className="py-1.5">Jenis Transportasi</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5 flex flex-col gap-1">
                                <div>
                                    <span className="inline-block w-3 h-3 border border-black text-center leading-[10px] mr-1">{data.transportation_type?.toLowerCase() === 'darat' ? 'x' : '\u00A0'}</span> Darat
                                </div>
                                <div>
                                    <span className="inline-block w-3 h-3 border border-black text-center leading-[10px] mr-1">{data.transportation_type?.toLowerCase() === 'laut' ? 'x' : '\u00A0'}</span> Laut
                                </div>
                                <div>
                                    <span className="inline-block w-3 h-3 border border-black text-center leading-[10px] mr-1">{data.transportation_type?.toLowerCase() === 'udara' ? 'x' : '\u00A0'}</span> Udara
                                </div>
                            </td>
                        </tr>
                        <tr className="align-top">
                            <td className="py-1.5">9.</td>
                            <td className="py-1.5">No. Polisi</td>
                            <td className="py-1.5">:</td>
                            <td className="py-1.5">
                                <div className="border border-black px-2 py-1 w-[90%]">{data.vehicle_number || 'Sesuai Lampiran'}</div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div className="mt-3 mb-10">
                    Demikian surat tugas ini kami buat. Atas perhatiannya kami ucapkan terima kasih.
                </div>
            </PageContainer>

            {/* PAGE 2: LAMPIRAN */}
            <PageContainer>
                <HeaderBlock title="LAMPIRAN PENGAJUAN" showSignature={true} />

                <table className="w-full border-collapse border border-black mt-6">
                    <thead>
                        <tr>
                            <th className="border border-black p-2 bg-white text-center font-bold w-[5%]">NO</th>
                            <th className="border border-black p-2 bg-white text-center font-bold w-[40%]">ITEM</th>
                            <th className="border border-black p-2 bg-white text-center font-bold w-[30%]">KETERANGAN</th>
                            <th className="border border-black p-2 bg-white text-center font-bold w-[25%]">BIAYA (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => {
                            const qty = parseFloat(item.quantity) || 0;
                            const cost = parseFloat(item.estimated_cost) || 0;
                            const subtotal = qty * cost;
                            return (
                                <tr key={idx}>
                                    <td className="border border-black p-2 text-center">{itemCounter++}</td>
                                    <td className="border border-black p-2">
                                        {item.item_name 
                                            ? (item.item_name.toUpperCase().startsWith('BIAYA ') ? item.item_name.toUpperCase() : `BIAYA ${item.item_name.toUpperCase()}`) 
                                            : '-'}
                                    </td>
                                    <td className="border border-black p-2 text-center">{qty} x Rp. {formatRupiah(cost)}</td>
                                    <td className="border border-black p-2 text-right">Rp. {formatRupiah(subtotal)}</td>
                                </tr>
                            );
                        })}
                        <tr>
                            <td colSpan="3" className="border border-black p-2 font-bold">TOTAL ESTIMASI BIAYA PERJALANAN</td>
                            <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(totalCost)}</td>
                        </tr>
                        {(!data.payment_option || data.payment_option === 'PANJAR BIAYA 50%') ? (
                            <>
                                <tr>
                                    <td colSpan="3" className="border border-black p-2 font-bold">PANJAR BIAYA 50%</td>
                                    <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(panjarCost)}</td>
                                </tr>
                                <tr>
                                    <td colSpan="3" className="border border-black p-2 font-bold">SISA BIAYA KLAIM PERJALANAN</td>
                                    <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(panjarCost)}</td>
                                </tr>
                            </>
                        ) : (
                            <tr>
                                <td colSpan="3" className="border border-black p-2 font-bold">BAYAR FULL</td>
                                <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(totalCost)}</td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="text-red-600 font-bold mt-6">
                    Rek ....... A/N {user?.name || '-'} (.........................)
                </div>
            </PageContainer>
        </div>
    );
}
