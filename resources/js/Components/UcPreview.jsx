import React from 'react';

export default function UcPreview({ data, user }) {
    const formatRupiah = (val) => new Intl.NumberFormat('id-ID').format(val || 0);
    
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const gasCost = parseFloat(data.estimated_gas_cost) || 0;
    const mealsCost = parseFloat(data.estimated_meals_cost) || 0;
    const hotelCost = parseFloat(data.estimated_accommodation_cost) || 0;
    const flightCost = parseFloat(data.flight_ticket_cost) || 0;
    const shipCost = parseFloat(data.ship_ticket_cost) || 0;
    const totalCost = gasCost + mealsCost + hotelCost + flightCost + shipCost;
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
                        <div className="font-bold underline">Bapak Manajer</div>
                    </td>
                    <td className="border border-black p-2 h-12 lg:h-16 align-bottom">
                        <div className="font-bold underline">Ibu Finance</div>
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

    const HeaderBlock = ({ title }) => (
        <div className="flex justify-between items-start mb-6">
            <div className="w-1/2">
                <p className="text-[#1a75d2] font-bold text-sm lg:text-base leading-tight mb-0 uppercase">{data.entity || 'PT. SANZAYA MEDIKA PRATAMA'}</p>
                <p className="text-gray-500 font-bold text-[8px] lg:text-[10px] leading-tight mb-4">MEDICAL & HEALTHCARE</p>
                
                <p className="font-bold text-xs lg:text-sm leading-tight mt-6">{title}</p>
                <p className="font-bold text-sm lg:text-base leading-tight mt-0.5">UPCOUNTRY (UC)</p>
            </div>
            <div className="w-1/2 pl-4 flex justify-end">
                <div className="w-full max-w-[220px] lg:max-w-[280px]">
                    <SignatureBlock />
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full h-full max-h-[85vh] overflow-y-auto custom-scrollbar pr-2">
            
            {/* PAGE 1: FORM PENGAJUAN */}
            <PageContainer>
                <HeaderBlock title="FORM PENGAJUAN BIAYA" />

                <div className="text-right font-bold my-4">
                    Makassar, {formatDate(new Date().toISOString())}
                </div>

                <div className="mb-4 leading-normal">
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
                                    <div className="border border-black px-2 py-1 flex-1">{data.companions && data.companions[0] ? data.companions[0].name : '-'} {data.companions && data.companions[0]?.position ? `(${data.companions[0].position})` : ''}</div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>2.</span>
                                    <div className="border border-black px-2 py-1 flex-1">{data.companions && data.companions[1] ? data.companions[1].name : '-'} {data.companions && data.companions[1]?.position ? `(${data.companions[1].position})` : ''}</div>
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

                <div className="mt-8">
                    Demikian surat tugas ini kami buat. Atas perhatiannya kami ucapkan terima kasih.
                </div>
            </PageContainer>

            {/* PAGE 2: LAMPIRAN */}
            <PageContainer>
                <HeaderBlock title="LAMPIRAN PENGAJUAN" />

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
                        <tr>
                            <td className="border border-black p-2 text-center">{itemCounter++}</td>
                            <td className="border border-black p-2">BIAYA BAHAN BAKAR / TIKET DARAT</td>
                            <td className="border border-black p-2 text-center">Transportasi</td>
                            <td className="border border-black p-2 text-right">Rp. {formatRupiah(gasCost)}</td>
                        </tr>
                        {flightCost > 0 && (
                        <tr>
                            <td className="border border-black p-2 text-center">{itemCounter++}</td>
                            <td className="border border-black p-2">BIAYA TIKET PESAWAT</td>
                            <td className="border border-black p-2 text-center">Transportasi Udara</td>
                            <td className="border border-black p-2 text-right">Rp. {formatRupiah(flightCost)}</td>
                        </tr>
                        )}
                        {shipCost > 0 && (
                        <tr>
                            <td className="border border-black p-2 text-center">{itemCounter++}</td>
                            <td className="border border-black p-2">BIAYA TIKET KAPAL</td>
                            <td className="border border-black p-2 text-center">Transportasi Laut</td>
                            <td className="border border-black p-2 text-right">Rp. {formatRupiah(shipCost)}</td>
                        </tr>
                        )}
                        <tr>
                            <td className="border border-black p-2 text-center">{itemCounter++}</td>
                            <td className="border border-black p-2">BIAYA KONSUMSI</td>
                            <td className="border border-black p-2 text-center">Makan</td>
                            <td className="border border-black p-2 text-right">Rp. {formatRupiah(mealsCost)}</td>
                        </tr>
                        <tr>
                            <td className="border border-black p-2 text-center">{itemCounter++}</td>
                            <td className="border border-black p-2">BIAYA PENGINAPAN</td>
                            <td className="border border-black p-2 text-center">Akomodasi (Hotel)</td>
                            <td className="border border-black p-2 text-right">Rp. {formatRupiah(hotelCost)}</td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="border border-black p-2 font-bold">TOTAL ESTIMASI BIAYA PERJALANAN</td>
                            <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(totalCost)}</td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="border border-black p-2 font-bold">PANJAR BIAYA 50%</td>
                            <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(panjarCost)}</td>
                        </tr>
                        <tr>
                            <td colSpan="3" className="border border-black p-2 font-bold">SISA BIAYA KLAIM PERJALANAN</td>
                            <td className="border border-black p-2 text-right font-bold">Rp. {formatRupiah(panjarCost)}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="text-red-600 font-bold mt-6">
                    Rek ....... A/N {user?.name || '-'} (.........................)
                </div>
            </PageContainer>
        </div>
    );
}
