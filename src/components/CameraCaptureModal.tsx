import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, Upload, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePhoto: (photoBase64: string) => void;
  hoTen: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onSavePhoto,
  hoTen,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [fileSizeKb, setFileSizeKb] = useState<number | null>(null);

  // Start Camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhoto(null);
      setCameraError(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } else {
        setCameraError('Trình duyệt không hỗ trợ truy cập Camera trực tiếp. Vui lòng chọn tệp ảnh 4x6.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Không thể mở Camera (đã bị chặn quyền hoặc đang chạy trong sandbox). Bạn có thể chọn ảnh 4x6 từ thư viện máy.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    // Standard 4x6 cm ratio is 2:3 (e.g. 600 x 900 px or min 472 x 709 px)
    const targetWidth = 600;
    const targetHeight = 900;
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Crop center 2:3 from video feed
    const vWidth = video.videoWidth || 640;
    const vHeight = video.videoHeight || 480;

    // Crop box with 2:3 ratio
    let cropWidth = vWidth;
    let cropHeight = vWidth * 1.5;
    if (cropHeight > vHeight) {
      cropHeight = vHeight;
      cropWidth = vHeight / 1.5;
    }

    const startX = (vWidth - cropWidth) / 2;
    const startY = (vHeight - cropHeight) / 2;

    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);

    // Compress to JPEG with target quality (200KB - 400KB)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);

    // Approximate size in KB
    const head = 'data:image/jpeg;base64,';
    const sizeInBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
    setFileSizeKb(Math.round(sizeInBytes / 1024));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const targetWidth = 600;
        const targetHeight = 900;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Crop center 2:3 from uploaded image
        let cropWidth = img.width;
        let cropHeight = img.width * 1.5;
        if (cropHeight > img.height) {
          cropHeight = img.height;
          cropWidth = img.height / 1.5;
        }
        const startX = (img.width - cropWidth) / 2;
        const startY = (img.height - cropHeight) / 2;

        ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedPhoto(dataUrl);

        const head = 'data:image/jpeg;base64,';
        const sizeInBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
        setFileSizeKb(Math.round(sizeInBytes / 1024));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (capturedPhoto) {
      onSavePhoto(capturedPhoto);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-slate-900 text-white rounded-2xl max-w-lg w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-yellow-400">
              Chụp ảnh Chân dung 4×6 cm Chuẩn Quân y
            </h3>
            <p className="text-[11px] text-slate-400">
              Công dân: <strong className="text-white">{hoTen}</strong> · Tỷ lệ 2:3 theo TT 106/2025/TT-BQP
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng chụp ảnh"
            className="p-1 text-slate-400 hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative bg-black flex items-center justify-center min-h-[380px] p-2 overflow-hidden">
          {capturedPhoto ? (
            <div className="relative">
              <img
                src={capturedPhoto}
                alt="Ảnh 4x6 đã chụp"
                className="w-[240px] h-[360px] object-cover rounded-md border-2 border-emerald-500 shadow-lg"
              />
              <div className="absolute top-2 right-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                4×6 cm · {fileSizeKb} KB (Chuẩn 200-400KB)
              </div>
            </div>
          ) : (
            <div className="relative w-[240px] h-[360px] bg-slate-950 rounded-md overflow-hidden border border-slate-700 flex items-center justify-center">
              {stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 mb-3">
                    {cameraError || 'Đang chuẩn bị Camera...'}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-lg inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn tệp ảnh thẻ có sẵn</span>
                  </button>
                </div>
              )}

              {/* Viewfinder Alignment Overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-yellow-400/70">
                {/* Horizontal Eye Level Guide (Vạch căn ngang tầm mắt ở 1/3 trên) */}
                <div className="absolute top-[35%] left-2 right-2 border-t border-dashed border-yellow-300/80">
                  <span className="absolute -top-3.5 right-1 text-[9px] bg-slate-900/80 text-yellow-300 px-1 rounded">
                    Tầm mắt
                  </span>
                </div>

                {/* Vertical Midline (Trục dọc giữa khuôn mặt) */}
                <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 border-l border-dashed border-yellow-300/60"></div>

                {/* Shoulder bounds guide */}
                <div className="absolute bottom-[10%] left-[15%] right-[15%] h-[20%] border-t border-x border-cyan-400/60 rounded-t-xl">
                  <span className="absolute -top-3.5 left-2 text-[9px] bg-slate-900/80 text-cyan-300 px-1 rounded">
                    Vùng vai
                  </span>
                </div>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Instructions / Validation notes */}
        <div className="px-4 py-2 bg-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between border-t border-slate-800">
          <span>Quy chuẩn: Nền sáng, đầu trần, mắt nhìn thẳng, rõ 2 tai, không đeo kính râm.</span>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
          {capturedPhoto ? (
            <>
              <button
                onClick={() => {
                  setCapturedPhoto(null);
                  startCamera();
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Chụp lại</span>
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận dùng ảnh này</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh lên</span>
              </button>
              {stream && (
                <button
                  onClick={handleCapture}
                  className="flex items-center gap-1.5 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-slate-950 rounded-lg text-xs font-bold shadow"
                >
                  <Camera className="w-4 h-4" />
                  <span>Bấm chụp 4×6</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
