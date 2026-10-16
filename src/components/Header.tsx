import React from 'react';
import {
  Shield,
  Smartphone,
  Monitor,
  UserCheck,
  CloudCheck,
  CloudOff,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { TaiKhoan } from '../types/nvqs.ts';

interface HeaderProps {
  currentRole: TaiKhoan;
  allRoles: TaiKhoan[];
  onSelectRole: (role: TaiKhoan) => void;
  isMobileView: boolean;
  onToggleMobileView: () => void;
  selectedYear: number;
  onChangeYear: (year: number) => void;
  offlineQueueCount: number;
  onOpenSyncModal: () => void;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  allRoles,
  onSelectRole,
  isMobileView,
  onToggleMobileView,
  selectedYear,
  onChangeYear,
  offlineQueueCount,
  onOpenSyncModal,
  activeTab,
  onNavigateTab,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark & Emblem */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-700 flex items-center justify-center border border-yellow-400/50 shadow-inner shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-base tracking-tight text-yellow-400 uppercase truncate">
                  Quản lý NVQS
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold bg-emerald-800 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-600/50 shrink-0">
                  Phường
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block">
                Luật NVQS hợp nhất 2026 · TT 68/2025 · TT 105/2023 · TT 106/2025 · NĐ 218/2025
              </p>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => onNavigateTab('tong_quan')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'tong_quan'
                  ? 'bg-slate-800 text-yellow-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Tổng quan & Chỉ tiêu
            </button>
            <button
              onClick={() => onNavigateTab('danh_sach')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'danh_sach'
                  ? 'bg-slate-800 text-yellow-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Danh sách Công dân
            </button>
            <button
              onClick={() => onNavigateTab('bieu_mau')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'bieu_mau'
                  ? 'bg-slate-800 text-yellow-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Biểu mẫu TT 106/2025
            </button>
            <button
              onClick={() => onNavigateTab('niem_yet')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'niem_yet'
                  ? 'bg-slate-800 text-yellow-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              07 Danh sách Niêm yết
            </button>
            <button
              onClick={() => onNavigateTab('xu_phat')}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'xu_phat'
                  ? 'bg-slate-800 text-yellow-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Xử phạt NĐ 218
            </button>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Year Selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:inline" />
              <select
                aria-label="Niên độ tuyển quân"
                value={selectedYear}
                onChange={(e) => onChangeYear(Number(e.target.value))}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              >
                <option value={2026} className="bg-slate-900 text-white">2026</option>
                <option value={2027} className="bg-slate-900 text-white">2027</option>
              </select>
            </div>

            {/* Offline sync button */}
            <button
              onClick={onOpenSyncModal}
              title={offlineQueueCount > 0 ? `${offlineQueueCount} hồ sơ chờ đồng bộ` : 'Dữ liệu đã đồng bộ'}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                offlineQueueCount > 0
                  ? 'bg-amber-950/60 border-amber-600 text-amber-300 hover:bg-amber-900/60'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {offlineQueueCount > 0 ? (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="tabular-nums font-bold">{offlineQueueCount}</span>
                </>
              ) : (
                <>
                  <CloudCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Đồng bộ</span>
                </>
              )}
            </button>

            {/* View Mode Toggle (Mobile Touch vs Desktop Admin) */}
            <button
              onClick={onToggleMobileView}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors ${
                isMobileView
                  ? 'bg-emerald-700 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title={isMobileView ? 'Chuyển sang Giao diện Máy tính (Ban CHQS)' : 'Chuyển sang Giao diện Di động (Khu đội trưởng)'}
              aria-label="Chuyển đổi giao diện"
            >
              {isMobileView ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
            </button>

            {/* Role Switcher */}
            <div className="relative">
              <select
                aria-label="Tài khoản cán bộ"
                value={currentRole.MA_TAI_KHOAN}
                onChange={(e) => {
                  const found = allRoles.find((r) => r.MA_TAI_KHOAN === e.target.value);
                  if (found) onSelectRole(found);
                }}
                className="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2 py-1.5 border border-slate-700 focus:outline-none focus:border-yellow-400 cursor-pointer max-w-[110px] sm:max-w-none truncate"
              >
                {allRoles.map((role) => (
                  <option key={role.MA_TAI_KHOAN} value={role.MA_TAI_KHOAN} className="bg-slate-900 text-white">
                    {role.CHUC_VU_DON_VI} ({role.HO_TEN_CAN_BO})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
