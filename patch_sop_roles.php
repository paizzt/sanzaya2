<?php
// 1. Update SopController.php
$fController = 'app/Http/Controllers/SopController.php';
$cController = file_get_contents($fController);

$abortCode = "\n        if (auth()->user()->role !== 'superadmin') { abort(403, 'Unauthorized action.'); }\n";

// Inject in storeDivision, destroyDivision, store, update, destroy
$funcsToProtect = ['public function storeDivision', 'public function destroyDivision', 'public function store', 'public function update', 'public function destroy'];
foreach($funcsToProtect as $func) {
    $pos = strpos($cController, $func);
    if ($pos !== false) {
        $bracePos = strpos($cController, '{', $pos);
        if ($bracePos !== false) {
            $cController = substr_replace($cController, '{' . $abortCode, $bracePos, 1);
        }
    }
}
file_put_contents($fController, $cController);
echo "Patched SopController.php\n";

// 2. Update Sops/Index.jsx
$fIndex = 'resources/js/Pages/Sops/Index.jsx';
$cIndex = file_get_contents($fIndex);

// Add condition to "Tambah Devisi" button
$cIndex = str_replace(
    '<button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Devisi
                    </button>',
    '{auth.user.role === \'superadmin\' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Devisi
                    </button>
                    )}',
    $cIndex
);

// Add condition to "Tambah Devisi Pertama" button
$cIndex = str_replace(
    '<button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Devisi Pertama
                        </button>',
    '{auth.user.role === \'superadmin\' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Devisi Pertama
                        </button>
                        )}',
    $cIndex
);

// Add condition to Trash2 button for divisions
$cIndex = str_replace(
    '<button 
                                            onClick={(e) => { e.preventDefault(); handleDelete(division.id); }}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Devisi"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>',
    '{auth.user.role === \'superadmin\' && (
                                        <button 
                                            onClick={(e) => { e.preventDefault(); handleDelete(division.id); }}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Devisi"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        )}',
    $cIndex
);
file_put_contents($fIndex, $cIndex);
echo "Patched Sops/Index.jsx\n";

// 3. Update Sops/Show.jsx
$fShow = 'resources/js/Pages/Sops/Show.jsx';
$cShow = file_get_contents($fShow);

// Tambah Pekerjaan button
$cShow = str_replace(
    '<button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Pekerjaan
                    </button>',
    '{auth.user.role === \'superadmin\' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Pekerjaan
                    </button>
                    )}',
    $cShow
);

// Tambah Pekerjaan button (empty state)
$cShow = str_replace(
    '<button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Pekerjaan
                        </button>',
    '{auth.user.role === \'superadmin\' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Pekerjaan
                        </button>
                        )}',
    $cShow
);

// Trash2 button
$cShow = str_replace(
    '<button 
                                            onClick={(e) => handleDelete(sop.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Pekerjaan"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>',
    '{auth.user.role === \'superadmin\' && (
                                        <button 
                                            onClick={(e) => handleDelete(sop.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Pekerjaan"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        )}',
    $cShow
);

// Edit Alur button
$cShow = str_replace(
    '{!isEditingContent ? (
                                    <button
                                        onClick={() => setIsEditingContent(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit Alur
                                    </button>
                                ) : (',
    '{!isEditingContent ? (
                                    auth.user.role === \'superadmin\' && (
                                        <button
                                            onClick={() => setIsEditingContent(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Alur
                                        </button>
                                    )
                                ) : (',
    $cShow
);

// Mulai Edit Alur button
$cShow = str_replace(
    '<button 
                                                onClick={() => setIsEditingContent(true)}
                                                className="mt-4 text-blue-600 font-medium hover:underline"
                                            >
                                                Mulai Edit Alur
                                            </button>',
    '{auth.user.role === \'superadmin\' && (
                                            <button 
                                                onClick={() => setIsEditingContent(true)}
                                                className="mt-4 text-blue-600 font-medium hover:underline"
                                            >
                                                Mulai Edit Alur
                                            </button>
                                            )}',
    $cShow
);

file_put_contents($fShow, $cShow);
echo "Patched Sops/Show.jsx\n";
