import { QrCode, X } from 'lucide-react';
import { useState } from 'react';

export default function DownloadBarcodeForm({ user }) {
    const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);

    const downloadImage = (format) => {
        const svgUrl = `/users/${user.id}/download-barcode`;
        
        if (format === 'svg') {
            const a = document.createElement('a');
            a.href = svgUrl;
            a.download = `barcode-${user.name}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const padding = 20;
            canvas.width = img.width + (padding * 2);
            canvas.height = img.height + (padding * 2);
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.drawImage(img, padding, padding);
            
            const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
            const dataUrl = canvas.toDataURL(mimeType, 1.0);
            
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `barcode-${user.name}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        img.src = svgUrl;
    };

    return (
        <section className="flex-1 flex flex-col justify-between">
            <header>
                <p className="text-sm text-gray-600 mb-6">
                    Unduh QR Code Tanda Tangan Digital Anda. Anda dapat menggunakannya untuk ditempel pada laporan atau dokumen resmi perusahaan.
                </p>
            </header>

            <div>
                <button
                    type="button"
                    onClick={() => setBarcodeModalOpen(true)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all gap-2"
                >
                    <QrCode className="w-4 h-4" /> Unduh Barcode
                </button>
            </div>

            {/* MODAL BARCODE */}
            {barcodeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Unduh Barcode</h3>
                                <p className="text-xs text-gray-500">{user.name}</p>
                            </div>
                            <button type="button" onClick={() => setBarcodeModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex flex-col items-center">
                            <div className="bg-gray-50 p-4 rounded-2xl mb-6 shadow-inner border border-gray-100">
                                <img src={`/users/${user.id}/download-barcode?format=svg`} alt="QR Code" className="w-48 h-48 mx-auto" />
                            </div>
                            
                            <p className="text-sm text-gray-600 text-center mb-6">Pilih format file untuk mengunduh QR Code Tanda Tangan Digital:</p>
                            
                            <div className="grid grid-cols-1 gap-3 w-full">
                                <button type="button" onClick={() => downloadImage('svg')} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-800 text-white hover:bg-gray-700 rounded-xl font-semibold transition-colors">
                                    Unduh format SVG
                                </button>
                                <button type="button" onClick={() => downloadImage('png')} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-800 text-white hover:bg-gray-700 rounded-xl font-semibold transition-colors">
                                    Unduh format PNG
                                </button>
                                <button type="button" onClick={() => downloadImage('jpg')} className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-800 text-white hover:bg-gray-700 rounded-xl font-semibold transition-colors">
                                    Unduh format JPG
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
