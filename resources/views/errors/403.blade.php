<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Akses Ditolak - 403</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="antialiased bg-gray-50 flex items-center justify-center min-h-screen">
    <div class="max-w-lg w-full px-6">
        <div class="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 text-center border border-gray-100">
            <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg class="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            
            <h1 class="text-3xl font-bold text-gray-900 mb-2">403 - Akses Ditolak</h1>
            <p class="text-gray-500 mb-8 leading-relaxed">
                Maaf, Anda tidak memiliki izin untuk mengakses halaman atau fitur ini. Silakan hubungi administrator jika Anda merasa ini adalah sebuah kesalahan.
            </p>

            <div class="flex justify-center">
                <a href="/" onclick="window.top.location.href = '/'; return false;" class="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                    Kembali
                </a>
            </div>
        </div>
    </div>
</body>
</html>
