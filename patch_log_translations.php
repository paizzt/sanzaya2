<?php
$file = 'resources/js/Pages/System/ActivityLog.jsx';
$content = file_get_contents($file);

$newHelper = "
    const renderJsonData = (jsonString) => {
        if (!jsonString) return <span className=\"text-gray-400 italic\">Tidak ada data</span>;
        try {
            const data = JSON.parse(jsonString);
            
            // Kamus terjemahan field ke bahasa manusia
            const kamus = {
                'name': 'Nama',
                'email': 'Alamat Email',
                'role': 'Hak Akses',
                'password': 'Kata Sandi',
                'remember_token': 'Sesi Login',
                'created_at': 'Dibuat Pada',
                'updated_at': 'Diperbarui Pada',
                'email_verified_at': 'Email Diverifikasi Pada',
                'phone': 'Nomor Telepon',
                'address': 'Alamat',
                'status': 'Status',
                'description': 'Deskripsi',
                'title': 'Judul',
                'date': 'Tanggal',
                'amount': 'Nominal / Jumlah'
            };

            // Filter field sistem yang mungkin membingungkan atau ubah bahasanya
            const filteredData = Object.entries(data).filter(([key, value]) => {
                // Abaikan field ini agar tidak muncul
                if (['id', 'updated_at'].includes(key)) return false;
                return true;
            });

            if (filteredData.length === 0) return <span className=\"text-gray-400 italic\">Tidak ada perubahan data penting</span>;
            
            return (
                <div className=\"space-y-3\">
                    {filteredData.map(([key, value]) => (
                        <div key={key} className=\"flex flex-col sm:flex-row sm:items-center sm:gap-4 border-b border-gray-100/80 pb-3 last:border-0 last:pb-0\">
                            <div className=\"sm:w-1/3 font-semibold text-gray-700\">
                                {kamus[key] || key.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}
                            </div>
                            <div className=\"sm:w-2/3 text-gray-800 bg-gray-50/50 px-3 py-2 rounded-lg border border-gray-100\">
                                {key === 'remember_token' || key === 'password' ? (
                                    <span className=\"text-gray-400 italic text-xs\">(Disembunyikan demi keamanan)</span>
                                ) : value === null ? (
                                    <span className=\"text-gray-400 italic\">Kosong</span>
                                ) : (
                                    String(value)
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return <span className=\"text-red-500\">Format data tidak valid</span>;
        }
    };
";

// Use regex to replace the old renderJsonData function
$pattern = '/const renderJsonData = \(jsonString\) => \{.*?\n    \};/s';
$content = preg_replace($pattern, trim($newHelper), $content);

file_put_contents($file, $content);
echo "Patched ActivityLog.jsx translations\n";
