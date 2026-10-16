import React, { useState } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  RefreshCw,
  FolderTree,
  Lock,
  Database,
  ArrowRight,
  HardDrive,
  FileText,
  FileCheck,
} from 'lucide-react';
import { CauHinhHeThong, TaiLieuAnh, CongDan } from '../types/nvqs.ts';

interface CloudSyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  cauHinh: CauHinhHeThong;
  documents: TaiLieuAnh[];
  citizens: CongDan[];
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
}

export const CloudSyncStatusModal: React.FC<CloudSyncStatusModalProps> = ({
  isOpen,
  onClose,
  cauHinh,
  documents,
  citizens,
  onTriggerSync,
  isSyncing,
}) => {
  const [syncPhase, setSyncPhase] = useState<'IDLE' | 'PHASE_1' | 'PHASE_2' | 'COMPLETED'>('IDLE');
  const [syncedCount, setSyncedCount] = useState<number>(documents.length);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    setSyncPhase('PHASE_1');
    await new Promise((r) => setTimeout(r, 800));
    setSyncPhase('PHASE_2');
    await new Promise((r) => setTimeout(r, 800));
    await onTriggerSync();
    setSyncPhase('COMPLETED');
    setSyncedCount(documents.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-yellow-400">
                Đồng bộ Ngoại tuyến & Đám mây 2 Pha (LockService)
              </h3>
              <p className="text-xs text-slate-300">
                Google Drive (Cây thư mục 3 cấp) & Google Sheets (5 Bảng cốt lõi)
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng cửa sổ đồng bộ" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs">
          {/* Architecture Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Cơ chế Khóa Hàng đợi Chống trùng lặp (Idempotency Key):</span>
              <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                LockService: Active
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Khi nhiều Khu đội trưởng cùng tác nghiệp hiện trường, hệ thống đảm bảo cấp Mã định danh duy nhất và đồng bộ tuần tự 2 pha, không bao giờ tạo hồ sơ rác hoặc cấp trùng mã hồ sơ.
            </p>

            {/* 2-Phase Process Steps */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className={`p-3 rounded-lg border transition-colors ${
                syncPhase === 'PHASE_1' ? 'bg-blue-50 border-blue-400' : 'bg-white border-slate-200'
              }`}>
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Pha 1: Google Drive</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Tải tệp ảnh thẻ 4×6, scan giấy tờ để nhận Drive_File_ID hợp lệ.
                </p>
              </div>

              <div className={`p-3 rounded-lg border transition-colors ${
                syncPhase === 'PHASE_2' ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200'
              }`}>
                <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Pha 2: Google Sheets</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Ghi toàn bộ trường dữ liệu và Drive_File_ID vào 5 bảng trung tâm.
                </p>
              </div>
            </div>
          </div>

          {/* Drive Folder Hierarchy (Section 3.2) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <FolderTree className="w-4 h-4 text-amber-600" />
              <span>Cấu trúc Cây thư mục trên Google Drive:</span>
            </div>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] space-y-1 overflow-x-auto">
              <div className="text-amber-400">Root_NVQS_Phuong_{cauHinh.NAM_TUYEN_QUAN_HIEN_TAI}/</div>
              <div className="pl-4 text-blue-300">├── KP_01/</div>
              <div className="pl-8 text-slate-300">├── CD_000101_NGUYEN_VAN_AN/</div>
              <div className="pl-12 text-emerald-400">├── CD_000101_THE_4X6_001.jpg</div>
              <div className="pl-12 text-emerald-400">├── CD_000101_CCCD_001_001.jpg</div>
              <div className="pl-12 text-emerald-400">└── CD_000101_XNSV_001_001.jpg</div>
              <div className="pl-4 text-blue-300">├── KP_02/</div>
              <div className="pl-4 text-blue-300">└── KP_03/ ...</div>
            </div>
          </div>

          {/* Synchronized status stats */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Tổng số tài liệu minh chứng đã gắn mã định danh 3 cấp:</span>
            </div>
            <span className="font-mono font-bold text-sm tabular-nums text-emerald-800">
              {documents.length} tài liệu
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 text-xs">
            Trạng thái đệm: <strong className="text-slate-800">Đã lưu trữ IndexedDB an toàn</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartSync}
              disabled={isSyncing || syncPhase === 'PHASE_1' || syncPhase === 'PHASE_2'}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white rounded-lg text-xs font-bold transition-all shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || syncPhase === 'PHASE_1' || syncPhase === 'PHASE_2' ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang đồng bộ 2 pha...' : 'Thực hiện Đồng bộ ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
