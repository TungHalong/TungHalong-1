import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Check, RotateCcw, X, MapPin, Navigation } from 'lucide-react';

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureBase64: string, gpsInfo: { lat: number; lng: number; accuracy?: number }) => void;
  citizenName: string;
}

export const SignatureCanvasModal: React.FC<SignatureCanvasModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  citizenName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [gps, setGps] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Capture GPS on open
  useEffect(() => {
    if (!isOpen) return;

    setGpsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGps({
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lng: Math.round(pos.coords.longitude * 10000) / 10000,
            accuracy: Math.round(pos.coords.accuracy),
          });
          setGpsLoading(false);
        },
        () => {
          // Fallback to ward coordinate simulation
          setGps({
            lat: 10.8012,
            lng: 106.6985,
            accuracy: 8,
          });
          setGpsLoading(false);
        },
        { timeout: 6000 }
      );
    } else {
      setGps({ lat: 10.8012, lng: 106.6985, accuracy: 10 });
      setGpsLoading(false);
    }

    // Initialize canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const dataUrl = canvas.toDataURL('image/png');
    const finalGps = gps || { lat: 10.8012, lng: 106.6985, accuracy: 5 };
    onSaveSignature(dataUrl, finalGps);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="w-4 h-4 text-yellow-400" />
            <div>
              <h3 className="font-bold text-sm text-yellow-400">
                Chữ ký Điện tử tại Hộ gia đình
              </h3>
              <p className="text-[11px] text-slate-300">
                Xác thực thu thập thông tin: <strong>{citizenName}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng ký"
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPS location stamping indicator */}
        <div className="px-4 py-2 bg-emerald-50 text-emerald-800 border-b border-emerald-100 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Định vị GPS cán bộ:</span>
          </div>
          <span className="font-mono font-semibold tabular-nums">
            {gpsLoading ? 'Đang định vị...' : `${gps?.lat}, ${gps?.lng} (±${gps?.accuracy}m)`}
          </span>
        </div>

        {/* Canvas Area */}
        <div className="p-4 bg-slate-50 flex flex-col items-center">
          <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
            <canvas
              ref={canvasRef}
              width={380}
              height={180}
              className="touch-none cursor-crosshair block"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />

            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs italic">
                Ký tên trực tiếp bằng ngón tay hoặc bút cảm ứng tại đây
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 text-center">
            Công dân hoặc thân nhân đại diện ký tên xác nhận đúng lời khai.
          </p>
        </div>

        {/* Footer controls */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ký lại</span>
          </button>

          <button
            disabled={!hasDrawn}
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg text-white shadow transition-all ${
              hasDrawn
                ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Lưu Chữ ký & Đóng dấu GPS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
