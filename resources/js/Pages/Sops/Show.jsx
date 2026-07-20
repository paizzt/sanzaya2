import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, FileText, Trash2, Edit2, Check, X, BookOpen, ImageIcon } from 'lucide-react';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Show({ auth, division }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedSop, setSelectedSop] = useState(null);
    const [isEditingContent, setIsEditingContent] = useState(false);
    
    // Form for adding new SOP
    const { data: addData, setData: setAddData, post: postAdd, processing: processingAdd, errors: addErrors, reset: resetAdd } = useForm({
        title: '',
        description: ''
    });

    // Form for editing SOP content
    const { data: editData, setData: setEditData, post: postEdit, processing: processingEdit, errors: editErrors } = useForm({
        _method: 'put',
        title: '',
        description: '',
        step_texts: [''],
        step_images: [null],
        existing_step_images: [null]
    });

    const submitAdd = (e) => {
        e.preventDefault();
        postAdd(route('sops.store', division.id), {
            onSuccess: () => {
                setShowAddModal(false);
                resetAdd();
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil',
                    text: 'Pekerjaan SOP berhasil ditambahkan',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        });
    };

    const handleDelete = (id, e) => {
        if(e) e.stopPropagation();
        Swal.fire({
            title: 'Hapus Pekerjaan?',
            text: "Detail alur pekerjaan ini akan dihapus permanen.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#9ca3af',
            confirmButtonText: 'Ya, Hapus',
            cancelButtonText: 'Batal',
            customClass: { popup: 'rounded-2xl' }
        }).then((result) => {
            if (result.isConfirmed) {
                import('@inertiajs/react').then(({ router }) => {
                    router.delete(route('sops.destroy', id), {
                        onSuccess: () => {
                            if (selectedSop && selectedSop.id === id) {
                                setSelectedSop(null);
                            }
                            Swal.fire({
                                icon: 'success',
                                title: 'Terhapus',
                                text: 'Pekerjaan berhasil dihapus',
                                timer: 1500,
                                showConfirmButton: false,
                                customClass: { popup: 'rounded-2xl' }
                            });
                        }
                    });
                });
            }
        });
    };

    const openSopModal = (sop) => {
        setSelectedSop(sop);
        
        let texts = [''];
        let images = [null];
        
        if (sop.steps && sop.steps.length > 0) {
            texts = sop.steps.map(s => typeof s === 'string' ? s : (s.text || ''));
            images = sop.steps.map(s => typeof s === 'string' ? null : (s.image || null));
        }

        setEditData({
            _method: 'put',
            title: sop.title,
            description: sop.description || '',
            step_texts: texts,
            existing_step_images: images,
            step_images: texts.map(() => null)
        });
        setIsEditingContent(false);
    };

    const submitEdit = (e) => {
        if(e) e.preventDefault();
        
        postEdit(route('sops.update', selectedSop.id), {
            forceFormData: true,
            onSuccess: (page) => {
                setIsEditingContent(false);
                // Update selectedSop with the new data from props
                const updatedSop = page.props.division.sops.find(s => s.id === selectedSop.id);
                if (updatedSop) {
                    setSelectedSop(updatedSop);
                }
                Swal.fire({
                    icon: 'success',
                    title: 'Tersimpan',
                    text: 'Detail SOP berhasil diperbarui',
                    timer: 1500,
                    showConfirmButton: false,
                    customClass: { popup: 'rounded-2xl' }
                });
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`SOP - ${division.name}`} />

            <div className="py-8 lg:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link href={route('sops.index')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Devisi
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            Devisi: {division.name}
                        </h1>
                        <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                            Daftar Pekerjaan (SOP) untuk devisi {division.name}.
                        </p>
                    </div>

                    {auth.user.role === 'superadmin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 border border-transparent rounded-xl font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Pekerjaan
                    </button>
                    )}
                </div>

                {division.sops.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada Pekerjaan</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Tambahkan pekerjaan baru untuk mulai menulis alur kerjanya.
                        </p>
                        {auth.user.role === 'superadmin' && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Pekerjaan
                        </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {division.sops.map((sop) => (
                            <div 
                                key={sop.id} 
                                onClick={() => openSopModal(sop)}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden group cursor-pointer"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        {auth.user.role === 'superadmin' && (
                                        <button 
                                            onClick={(e) => handleDelete(sop.id, e)}
                                            className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Hapus Pekerjaan"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{sop.title}</h3>
                                    <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
                                        Lihat Detail Alur <ArrowLeft className="w-4 h-4 ml-1 rotate-180" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Pekerjaan */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="md">
                <form onSubmit={submitAdd} className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">
                        Tambah Pekerjaan Baru
                    </h2>

                    <div className="mb-6">
                        <InputLabel htmlFor="title" value="Nama Pekerjaan" />
                        <TextInput
                            id="title"
                            type="text"
                            name="title"
                            value={addData.title}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setAddData('title', e.target.value)}
                            placeholder="Contoh: Proses Rekrutmen"
                        />
                        <InputError message={addErrors.title} className="mt-2" />
                    </div>

                    <div className="flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowAddModal(false)}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton disabled={processingAdd}>
                            Simpan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Detail & Edit SOP */}
            <Modal show={selectedSop !== null} onClose={() => setSelectedSop(null)} maxWidth="3xl">
                {selectedSop && (
                    <div className="flex flex-col h-[85vh] max-h-[850px]">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                {selectedSop.title}
                            </h2>
                            <div className="flex items-center gap-2">
                                {!isEditingContent ? (
                                    auth.user.role === 'superadmin' && (
                                        <button
                                            onClick={() => setIsEditingContent(true)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit Alur
                                        </button>
                                    )
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                setIsEditingContent(false);
                                                openSopModal(selectedSop); // reset state
                                            }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-600 bg-gray-100 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                            disabled={processingEdit}
                                        >
                                            <X className="w-4 h-4" />
                                            Batal
                                        </button>
                                        <button
                                            onClick={submitEdit}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                            disabled={processingEdit}
                                        >
                                            <Check className="w-4 h-4" />
                                            Simpan
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedSop(null)}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-2"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-white">
                            {isEditingContent ? (
                                <div className="space-y-6">
                                    {/* Tahapan Pekerjaan */}
                                    <div>
                                        <InputLabel value="Tahapan Pekerjaan & Gambar" className="mb-3 text-lg font-bold text-gray-800" />
                                        <div className="space-y-4">
                                            {editData.step_texts.map((text, index) => (
                                                <div key={index} className="flex gap-3 items-start border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 font-bold rounded-lg flex items-center justify-center text-sm">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex-1 space-y-3">
                                                        <textarea
                                                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm p-3 min-h-[60px] text-sm"
                                                            value={text}
                                                            onChange={(e) => {
                                                                const newTexts = [...editData.step_texts];
                                                                newTexts[index] = e.target.value;
                                                                setEditData('step_texts', newTexts);
                                                            }}
                                                            placeholder="Deskripsi langkah pekerjaan..."
                                                        />
                                                        
                                                        <div className="flex items-center gap-3">
                                                            <label className="flex-1 cursor-pointer bg-white border border-gray-200 border-dashed rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                                                <input 
                                                                    type="file" 
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const newImages = [...editData.step_images];
                                                                        newImages[index] = e.target.files[0];
                                                                        setEditData('step_images', newImages);
                                                                    }}
                                                                    className="hidden"
                                                                />
                                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                                                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                                                                    {editData.step_images[index] 
                                                                        ? editData.step_images[index].name 
                                                                        : (editData.existing_step_images[index] ? 'Ganti gambar tersimpan' : 'Unggah Gambar (Opsional)')}
                                                                </span>
                                                            </label>
                                                            {editData.existing_step_images[index] && !editData.step_images[index] && (
                                                                <span className="text-xs text-green-600 font-medium whitespace-nowrap">✓ Ada Gambar</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newTexts = editData.step_texts.filter((_, i) => i !== index);
                                                            const newImages = editData.step_images.filter((_, i) => i !== index);
                                                            const newExistingImages = editData.existing_step_images.filter((_, i) => i !== index);
                                                            
                                                            setEditData({
                                                                ...editData,
                                                                step_texts: newTexts.length ? newTexts : [''],
                                                                step_images: newImages.length ? newImages : [null],
                                                                existing_step_images: newExistingImages.length ? newExistingImages : [null]
                                                            });
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus Tahap"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditData({
                                                    ...editData,
                                                    step_texts: [...editData.step_texts, ''],
                                                    step_images: [...editData.step_images, null],
                                                    existing_step_images: [...editData.existing_step_images, null]
                                                });
                                            }}
                                            className="mt-4 text-blue-600 font-medium text-sm flex items-center gap-1.5 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors w-fit"
                                        >
                                            <Plus className="w-4 h-4" /> Tambah Tahap
                                        </button>
                                        <InputError message={editErrors.step_texts} className="mt-2" />
                                        <InputError message={editErrors.step_images} className="mt-2" />
                                    </div>
                                    
                                    <hr className="border-gray-100" />

                                    {/* Catatan Tambahan (Description Lama) */}
                                    <div>
                                        <InputLabel value="Catatan Tambahan (Opsional)" className="mb-3 text-lg font-bold text-gray-800" />
                                        <textarea
                                            className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-sm resize-none p-4"
                                            placeholder="Tambahkan catatan khusus jika diperlukan..."
                                            value={editData.description}
                                            onChange={(e) => setEditData('description', e.target.value)}
                                            rows="4"
                                        ></textarea>
                                        <InputError message={editErrors.description} className="mt-2" />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-8">
                                    {/* Render Tahapan */}
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            Tahapan Pekerjaan
                                        </h3>
                                        {selectedSop.steps && selectedSop.steps.length > 0 && selectedSop.steps[0] !== '' && (typeof selectedSop.steps[0] === 'object' || typeof selectedSop.steps[0] === 'string') ? (
                                            <div className="space-y-6">
                                                {selectedSop.steps.map((step, idx) => {
                                                    const text = typeof step === 'object' ? step.text : step;
                                                    const image = typeof step === 'object' ? step.image : null;
                                                    
                                                    if ((!text || text.trim() === '') && !image) return null;
                                                    
                                                    return (
                                                        <div key={idx} className="flex gap-4">
                                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mt-1">
                                                                {idx + 1}
                                                            </div>
                                                            <div className="flex-1 space-y-3 pt-1.5">
                                                                {text && text.trim() !== '' && (
                                                                    <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap">{text}</p>
                                                                )}
                                                                {image && (
                                                                    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm inline-block max-w-full">
                                                                        <img 
                                                                            src={`/storage/${image}`} 
                                                                            alt={`Gambar tahap ${idx + 1}`}
                                                                            className="max-h-[300px] object-contain bg-gray-50"
                                                                        />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 italic">Belum ada tahapan yang ditambahkan.</p>
                                        )}
                                    </div>

                                    {/* Render Catatan */}
                                    {selectedSop.description && (
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">Catatan Tambahan</h3>
                                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5">
                                                <p className="text-gray-700 leading-relaxed text-[15px] whitespace-pre-wrap">{selectedSop.description}</p>
                                            </div>
                                        </div>
                                    )}

                                    {(!selectedSop.steps || selectedSop.steps.length === 0 || selectedSop.steps[0] === '') && !selectedSop.description && (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                            <FileText className="w-12 h-12 mb-4 text-gray-200" />
                                            <p>Detail SOP belum diisi.</p>
                                            {auth.user.role === 'superadmin' && (
                                            <button 
                                                onClick={() => setIsEditingContent(true)}
                                                className="mt-4 text-blue-600 font-medium hover:underline"
                                            >
                                                Mulai Edit Alur
                                            </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
