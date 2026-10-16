import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Printer,
  ShieldAlert,
  HeartPulse,
  Scale,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { CongDan, DienQuanLyNVQS, TrangThaiHoSo, TaiKhoan } from '../types/nvqs.ts';

interface CitizenListProps {
  citizens: CongDan[];
  currentRole: TaiKhoan;
  selectedYear: number;
  onSelectCitizen: (citizen: CongDan) => void;
  onOpenCreateCitizen: () => void;
  onOpenFormsForCitizen: (citizen: CongDan) => void;
  onOpenSanctionsForCitizen: (citizen: CongDan) => void;
  initialFilter?: string;
}

export const CitizenList: React.FC<CitizenListProps> = ({
  citizens,
  currentRole,
  selectedYear,
  onSelectCitizen,
  onOpenCreateCitizen,
  onOpenFormsForCitizen,
  onOpenSanctionsForCitizen,
  initialFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKhuPho, setFilterKhuPho] = useState<string>('ALL');
  const [filterDien, setFilterDien] = useState<string>(initialFilter || 'ALL');
  const [filterTrangThai, setFilterTrangThai] = useState<string>('ALL');
  const [filterAge, setFilterAge] = useState<string>('ALL');
  const [filterFlags, setFilterFlags] = useState<string>('ALL');

  // Filter options
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      // Role scope check: If user is CTV_KHU_PHO, restrict to their neighborhood
      if (currentRole.VAI_TRO_QUYEN === 'CTV_KHU_PHO' && currentRole.MA_KHU_PHO_PHU_TRACH) {
        if (c.MA_KHU_PHO !== currentRole.MA_KHU_PHO_PHU_TRACH) {
          return false;
        }
      }

      // Year match
      if (c.NAM_TUYEN_QUAN !== selectedYear) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = c.HO_TEN.toLowerCase().includes(query);
        const matchCccd = c.SO_CCCD.includes(query);
        const matchId = c.MA_HO_SO.toLowerCase().includes(query);
        const matchAddress = c.CHO_O_HIEN_NAY.toLowerCase().includes(query);
        if (!matchName && !matchCccd && !matchId && !matchAddress) {
          return false;
        }
      }

      // Neighborhood filter
      if (filterKhuPho !== 'ALL' && c.MA_KHU_PHO !== filterKhuPho) {
        return false;
      }

      // Status group filter
      if (filterDien !== 'ALL') {
        if (filterDien === 'NHOM_6' && c.DIEN_QUAN_LY_NVQS !== 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU') return false;
        if (filterDien === 'NHOM_5' && c.DIEN_QUAN_LY_NVQS !== 'NHOM_5_TAM_HOAN_GOI_NHAP_NGU') return false;
        if (filterDien === 'NHOM_1' && c.DIEN_QUAN_LY_NVQS !== 'NHOM_1_KHONG_DUOC_DANG_KY') return false;
        if (filterDien === 'NHOM_2' && c.DIEN_QUAN_LY_NVQS !== 'NHOM_2_MIEN_DANG_KY') return false;
        if (filterDien === 'NHOM_3' && c.DIEN_QUAN_LY_NVQS !== 'NHOM_3_HOAN_THANH_TAI_NGU') return false;
        if (filterDien === 'NHOM_4' && c.DIEN_QUAN_LY_NVQS !== 'NHOM_4_MIEN_GOI_NHAP_NGU') return false;
        if (filterDien === 'MIEN_HOAN_THANH') {
          const isMien = c.DIEN_QUAN_LY_NVQS === 'NHOM_2_MIEN_DANG_KY' || c.DIEN_QUAN_LY_NVQS === 'NHOM_4_MIEN_GOI_NHAP_NGU' || c.DIEN_QUAN_LY_NVQS === 'NHOM_3_HOAN_THANH_TAI_NGU';
          if (!isMien) return false;
        }
        if (filterDien === 'CANH_BAO') {
          const isWarn = c.TRANG_THAI_DK_BIEN_DONG === 'QUA_HAN_5_NGAY' || c.TINH_TRANG_CU_TRU === 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY' || (c.CHI_SO_BMI > 0 && (c.CHI_SO_BMI < 18 || c.CHI_SO_BMI > 29.9)) || (c.DO_CAN_THI_D || 0) > 1.5;
          if (!isWarn) return false;
        }
        if (filterDien === 'TUOI_17') {
          const birthYear = new Date(c.NGAY_SINH).getFullYear();
          if (selectedYear - birthYear !== 17) return false;
        }
      }

      // Review status filter
      if (filterTrangThai !== 'ALL' && c.TRANG_THAI_HOSO !== filterTrangThai) {
        return false;
      }

      // Age filter
      if (filterAge !== 'ALL') {
        const birthYear = new Date(c.NGAY_SINH).getFullYear();
        const age = selectedYear - birthYear;
        if (filterAge === '17' && age !== 17) return false;
        if (filterAge === '18-25' && (age < 18 || age > 25)) return false;
        if (filterAge === '26-27' && (age < 26 || age > 27)) return false;
      }

      // Flags filter
      if (filterFlags === 'TINH_NGUYEN' && !c.CO_DON_TINH_NGUYEN) return false;
      if (filterFlags === 'CANH_BAO_TT68') {
        const isBmiFail = c.CHI_SO_BMI > 0 && (c.CHI_SO_BMI < 18.0 || c.CHI_SO_BMI > 29.9);
        const isVisionFail = (c.DO_CAN_THI_D || 0) > 1.5 || (c.DO_VIEN_THI_D || 0) > 0;
        if (!isBmiFail && !isVisionFail) return false;
      }
      if (filterFlags === 'VI_PHAM_CU_TRU') {
        if (c.TRANG_THAI_DK_BIEN_DONG !== 'QUA_HAN_5_NGAY' && c.TINH_TRANG_CU_TRU !== 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY') {
          return false;
        }
      }

      return true;
    });
  }, [citizens, currentRole, selectedYear, searchTerm, filterKhuPho, filterDien, filterTrangThai, filterAge, filterFlags]);

  // Helper for Group badges
  const renderDienBadge = (dien: DienQuanLyNVQS) => {
    switch (dien) {
      case 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Nhóm 6 · Đủ điều kiện gọi khám
          </span>
        );
      case 'NHOM_5_TAM_HOAN_GOI_NHAP_NGU':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
            Nhóm 5 · Tạm hoãn
          </span>
        );
      case 'NHOM_1_KHONG_DUOC_DANG_KY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
            Nhóm 1 · Không được ĐK
          </span>
        );
      case 'NHOM_2_MIEN_DANG_KY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
            Nhóm 2 · Miễn đăng ký
          </span>
        );
      case 'NHOM_3_HOAN_THANH_TAI_NGU':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
            Nhóm 3 · Hoàn thành NVQS
          </span>
        );
      case 'NHOM_4_MIEN_GOI_NHAP_NGU':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
            Nhóm 4 · Miễn gọi nhập ngũ
          </span>
        );
      default:
        return null;
    }
  };

  const renderStatusBadge = (status: TrangThaiHoSo) => {
    switch (status) {
      case '01_DANG_THU_THAP':
        return <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">1. Đang thu thập</span>;
      case '02_CHO_KIEM_TRA':
        return <span className="text-[11px] text-blue-800 bg-blue-100 px-2 py-0.5 rounded">2. Chờ kiểm tra</span>;
      case '03_TRA_LAI_BO_SUNG':
        return <span className="text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded">3. Trả lại bổ sung</span>;
      case '04_CAN_XAC_MINH_CONG_AN_Y_TE':
        return <span className="text-[11px] text-purple-800 bg-purple-100 px-2 py-0.5 rounded">4. Xác minh CA/Y tế</span>;
      case '05_DA_DUYET_HOAN_THIEN':
        return <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium">5. Đã hoàn thiện</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, số CCCD, mã hồ sơ (CD_000123), địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Quick Add Button */}
          <button
            onClick={onOpenCreateCitizen}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm hồ sơ</span>
          </button>
        </div>

        {/* Filter controls row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Khu phố */}
          {currentRole.VAI_TRO_QUYEN !== 'CTV_KHU_PHO' && (
            <select
              aria-label="Lọc theo khu phố"
              value={filterKhuPho}
              onChange={(e) => setFilterKhuPho(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Toàn phường (5 Khu phố)</option>
              <option value="KP_01">Khu phố 1</option>
              <option value="KP_02">Khu phố 2</option>
              <option value="KP_03">Khu phố 3</option>
              <option value="KP_04">Khu phố 4</option>
              <option value="KP_05">Khu phố 5</option>
            </select>
          )}

          {/* 6 NVQS Groups */}
          <select
            aria-label="Lọc theo diện quản lý NVQS"
            value={filterDien}
            onChange={(e) => setFilterDien(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Tất cả diện quản lý</option>
            <option value="NHOM_6">Nhóm 6: Đủ ĐK gọi khám / Nhập ngũ</option>
            <option value="NHOM_5">Nhóm 5: Tạm hoãn gọi nhập ngũ</option>
            <option value="NHOM_1">Nhóm 1: Không được đăng ký</option>
            <option value="NHOM_2">Nhóm 2: Miễn đăng ký (10 bệnh)</option>
            <option value="NHOM_3">Nhóm 3: Hoàn thành NVQS (DQTT/CAX)</option>
            <option value="NHOM_4">Nhóm 4: Miễn gọi nhập ngũ</option>
          </select>

          {/* Age Bracket */}
          <select
            aria-label="Lọc theo độ tuổi"
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Mọi lứa tuổi (17 - 27)</option>
            <option value="17">Tuổi 17 (ĐK lần đầu tháng 4)</option>
            <option value="18-25">18 - 25 tuổi (Độ tuổi cơ bản)</option>
            <option value="26-27">26 - 27 tuổi (ĐH/CĐ kéo dài)</option>
          </select>

          {/* Review Status */}
          <select
            aria-label="Lọc theo trạng thái hồ sơ"
            value={filterTrangThai}
            onChange={(e) => setFilterTrangThai(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Mọi trạng thái duyệt</option>
            <option value="01_DANG_THU_THAP">1. Đang thu thập</option>
            <option value="02_CHO_KIEM_TRA">2. Chờ kiểm tra</option>
            <option value="03_TRA_LAI_BO_SUNG">3. Trả lại bổ sung</option>
            <option value="04_CAN_XAC_MINH_CONG_AN_Y_TE">4. Cần xác minh CA/YT</option>
            <option value="05_DA_DUYET_HOAN_THIEN">5. Đã duyệt hoàn thiện</option>
          </select>

          {/* Warning & Flag Filters */}
          <select
            aria-label="Lọc theo cờ đặc biệt"
            value={filterFlags}
            onChange={(e) => setFilterFlags(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            <option value="ALL">Tất cả cờ đặc biệt</option>
            <option value="TINH_NGUYEN">Có Đơn tình nguyện nhập ngũ</option>
            <option value="CANH_BAO_TT68">Cảnh báo đỏ TT 68 (Cận &gt; 1.5D, BMI)</option>
            <option value="VI_PHAM_CU_TRU">Cảnh báo vi phạm cư trú (NĐ 218)</option>
          </select>

          {/* Reset Filters */}
          {(searchTerm || filterKhuPho !== 'ALL' || filterDien !== 'ALL' || filterTrangThai !== 'ALL' || filterAge !== 'ALL' || filterFlags !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterKhuPho('ALL');
                setFilterDien('ALL');
                setFilterTrangThai('ALL');
                setFilterAge('ALL');
                setFilterFlags('ALL');
              }}
              className="text-slate-500 hover:text-slate-800 ml-auto font-medium"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Citizen Table & List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Hiển thị <strong className="text-slate-900 tabular-nums">{filteredCitizens.length}</strong> / {citizens.length} hồ sơ công dân
          </div>
        </div>

        {filteredCitizens.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm font-medium text-slate-600">Không tìm thấy hồ sơ công dân nào phù hợp</p>
            <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc đặt lại các bộ lọc</p>
          </div>
        ) : (
          <>
            {/* Mobile Touch Card View (Visible on < sm screens) */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filteredCitizens.map((citizen, idx) => {
                const birthYear = new Date(citizen.NGAY_SINH).getFullYear();
                const age = selectedYear - birthYear;
                const isBmiFail = citizen.CHI_SO_BMI > 0 && (citizen.CHI_SO_BMI < 18.0 || citizen.CHI_SO_BMI > 29.9);
                const isVisionFail = (citizen.DO_CAN_THI_D || 0) > 1.5 || (citizen.DO_VIEN_THI_D || 0) > 0;
                const isResidenceWarn =
                  citizen.TRANG_THAI_DK_BIEN_DONG === 'QUA_HAN_5_NGAY' ||
                  citizen.TINH_TRANG_CU_TRU === 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY';

                return (
                  <div
                    key={citizen.MA_HO_SO}
                    onClick={() => onSelectCitizen(citizen)}
                    className="p-4 active:bg-slate-50 transition-colors cursor-pointer space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900">{citizen.HO_TEN}</span>
                          {citizen.CO_DON_TINH_NGUYEN && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                              Tình nguyện
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          CCCD: <span className="font-mono">{citizen.SO_CCCD}</span> · <span className="font-semibold text-slate-700">{age} tuổi</span> ({citizen.MA_KHU_PHO})
                        </div>
                      </div>

                      <span className="font-mono text-xs bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                        {citizen.MA_HO_SO}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 line-clamp-1">
                      {citizen.CHO_O_HIEN_NAY}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {renderDienBadge(citizen.DIEN_QUAN_LY_NVQS)}
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {citizen.CHIEU_CAO_CM}cm · {citizen.CAN_NANG_KG}kg (BMI: {citizen.CHI_SO_BMI})
                      </span>
                    </div>

                    {(isBmiFail || isVisionFail || isResidenceWarn) && (
                      <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                        {(isBmiFail || isVisionFail) && (
                          <span className="text-rose-700 font-medium flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <HeartPulse className="w-3 h-3 text-rose-600" />
                            {isVisionFail && `Cận ${citizen.DO_CAN_THI_D}D (>1.5D)`}
                            {isBmiFail && `BMI: ${citizen.CHI_SO_BMI}`}
                          </span>
                        )}
                        {isResidenceWarn && (
                          <span className="text-amber-800 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            VPHC Cư trú
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div>{renderStatusBadge(citizen.TRANG_THAI_HO_SO)}</div>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectCitizen(citizen)}
                          className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => onOpenFormsForCitizen(citizen)}
                          className="p-1.5 text-slate-600 hover:text-blue-700 bg-slate-100 rounded"
                          title="In Mẫu 2 / Mẫu 3"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Visible on >= sm screens) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-3">Mã hồ sơ</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Ngày sinh / Tuổi</th>
                    <th className="py-3 px-3">Số CCCD</th>
                    <th className="py-3 px-3">Khu phố</th>
                    <th className="py-3 px-3">Thể lực & Khám SK</th>
                    <th className="py-3 px-3">Diện NVQS (Luật 2026)</th>
                    <th className="py-3 px-3">Trạng thái duyệt</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCitizens.map((citizen, idx) => {
                    const birthYear = new Date(citizen.NGAY_SINH).getFullYear();
                    const age = selectedYear - birthYear;
                    const isBmiFail = citizen.CHI_SO_BMI > 0 && (citizen.CHI_SO_BMI < 18.0 || citizen.CHI_SO_BMI > 29.9);
                    const isVisionFail = (citizen.DO_CAN_THI_D || 0) > 1.5 || (citizen.DO_VIEN_THI_D || 0) > 0;
                    const isResidenceWarn =
                      citizen.TRANG_THAI_DK_BIEN_DONG === 'QUA_HAN_5_NGAY' ||
                      citizen.TINH_TRANG_CU_TRU === 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY';

                    return (
                      <tr
                        key={citizen.MA_HO_SO}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                        onClick={() => onSelectCitizen(citizen)}
                      >
                        <td className="py-3 px-3 text-center text-slate-400 font-mono tabular-nums">
                          {idx + 1}
                        </td>

                        <td className="py-3 px-3 font-mono font-medium text-slate-700 whitespace-nowrap">
                          {citizen.MA_HO_SO}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                            <span>{citizen.HO_TEN}</span>
                            {citizen.CO_DON_TINH_NGUYEN && (
                              <span
                                title="Có Đơn tình nguyện nhập ngũ"
                                className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold"
                              >
                                ★
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {citizen.CHO_O_HIEN_NAY}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          <div className="tabular-nums font-mono">{citizen.NGAY_SINH}</div>
                          <div className="text-[11px] text-slate-400">
                            {age} tuổi {age === 17 && <strong className="text-blue-600">(ĐK Lần đầu)</strong>}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                          {citizen.SO_CCCD}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-medium text-slate-700">{citizen.MA_KHU_PHO}</span>
                          {isResidenceWarn && (
                            <div className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5 mt-0.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                              <span>VPHC Cư trú</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-700 tabular-nums">
                              {citizen.CHIEU_CAO_CM}cm · {citizen.CAN_NANG_KG}kg
                            </span>
                            <span className={`font-mono text-[11px] px-1.5 py-0.2 rounded font-semibold ${
                              isBmiFail ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                            }`}>
                              BMI: {citizen.CHI_SO_BMI}
                            </span>
                          </div>

                          {/* Warnings row */}
                          {(isBmiFail || isVisionFail) && (
                            <div className="text-[10px] text-rose-700 font-medium mt-0.5 flex items-center gap-1">
                              <HeartPulse className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>
                                {isVisionFail && `Cận ${citizen.DO_CAN_THI_D}D (> 1.5D) `}
                                {isBmiFail && `BMI ${citizen.CHI_SO_BMI}`}
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 max-w-[220px]">
                          {renderDienBadge(citizen.DIEN_QUAN_LY_NVQS)}
                          {citizen.LY_DO_TAM_HOAN_MIEN_CHI_TIET && (
                            <div className="text-[10px] text-slate-500 truncate mt-0.5" title={citizen.LY_DO_TAM_HOAN_MIEN_CHI_TIET}>
                              {citizen.LY_DO_TAM_HOAN_MIEN_CHI_TIET}
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          {renderStatusBadge(citizen.TRANG_THAI_HO_SO)}
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onSelectCitizen(citizen)}
                              title="Xem và chỉnh sửa hồ sơ"
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenFormsForCitizen(citizen)}
                              title="In Mẫu 2 / Mẫu 3 TT 106/2025"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {isResidenceWarn && (
                              <button
                                onClick={() => onOpenSanctionsForCitizen(citizen)}
                                title="Lập hồ sơ xử phạt vi phạm hành chính (NĐ 218)"
                                className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors"
                              >
                                <Scale className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
