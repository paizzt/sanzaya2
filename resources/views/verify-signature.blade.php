<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Tanda Tangan Digital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50 flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border-t-4 border-green-500">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Tanda Tangan Digital Valid</h1>
        <p class="text-gray-500 mb-6 text-sm">Dokumen ini telah ditandatangani secara digital dan sah.</p>
        
        <div class="bg-gray-50 rounded-xl p-4 text-left space-y-3 border border-gray-100">
            <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Nama Penandatangan</p>
                <p class="text-gray-900 font-medium">{{ $user->name }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Jabatan / Peran</p>
                <p class="text-gray-900 font-medium">{{ optional($user->division)->name ?? $user->role ?? 'Admin' }}</p>
            </div>
            <div>
                <p class="text-xs text-gray-400 uppercase tracking-wider font-semibold">Terdaftar Sejak</p>
                <p class="text-gray-900 font-medium">{{ $user->created_at->format('d F Y') }}</p>
            </div>
        </div>

        <div class="mt-8 text-xs text-gray-400">
            &copy; {{ date('Y') }} PT. Sanzaya. All rights reserved.
        </div>
    </div>
</body>
</html>
