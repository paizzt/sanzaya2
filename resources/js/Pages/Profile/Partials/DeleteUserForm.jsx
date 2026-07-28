import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { AlertTriangle, Trash2, Key } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <button
                onClick={confirmUserDeletion}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
                <Trash2 className="w-5 h-5" /> Hapus Akun
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-600">
                            <AlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Yakin ingin menghapus akun?
                            </h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Sekali akun Anda dihapus, semua sumber daya dan data akan dihapus secara permanen.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={deleteUser}>
                        <div className="mt-6">
                            <InputLabel htmlFor="password" value="Kata Sandi" className="sr-only" />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="block w-full pl-11 py-3 bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-red-500 transition-all"
                                    isFocused
                                    placeholder="Masukkan kata sandi untuk konfirmasi"
                                />
                            </div>
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-8 flex justify-end gap-3">
                            <SecondaryButton onClick={closeModal} className="h-11 px-6 rounded-xl border-gray-300">
                                Batal
                            </SecondaryButton>

                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 h-11"
                                disabled={processing}
                            >
                                <Trash2 className="w-4 h-4" /> Hapus Akun Secara Permanen
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
