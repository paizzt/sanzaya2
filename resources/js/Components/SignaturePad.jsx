import React, { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ onEnd }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        e.preventDefault(); // Prevent scrolling on touch
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        e.preventDefault();
        
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let x, y;
        if (e.touches && e.touches.length > 0) {
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.closePath();
        setIsDrawing(false);
        
        if (onEnd) {
            onEnd(canvas.toDataURL('image/png'));
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (onEnd) {
            onEnd('');
        }
    };

    return (
        <div className="w-full flex flex-col items-start gap-2">
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-white touch-none w-full max-w-lg shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-[200px] cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>
            <button
                type="button"
                onClick={clearCanvas}
                className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
            >
                Hapus Tanda Tangan
            </button>
        </div>
    );
}
