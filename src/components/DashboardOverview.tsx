import React from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ShieldCheck,
  TrendingUp,
  Percent,
  PlusCircle,
  Eye,
  FileCheck2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { CongDan, CauHinhHeThong } from '../types/nvqs.ts';
import { auditQuotasTT68 } from '../utils/nvqsRules.ts';

interface DashboardOverviewProps {
  citizens: CongDan[];
  cauHinh: CauHinhHeThong;
  onOpenCreateCitizen: () => void;
  onOpenFormsModal: () => void;
  onOpenPublicListsModal: () => void;
  onOpenSanctionsModal: () => void;
  onFilterByStatus: (status: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  citizens,
  cauHinh,
  onOpenCreateCitizen,
  onOpenFormsModal,
  onOpenPublicListsModal,
  onOpenSanctionsModal,
  onFilterByStatus,
}) => {
  // Statistics
  const total = citizens.length;
  const age17Count = citizens.filter((c) => {
    const birthYear = new Date(c.NGAY_SINH).getFullYear();
    return cauHinh.NAM_TUYEN_QUAN_HIEN_TAI - birthYear === 17;
  }).length;

  const qualifiedGroup6 = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU'
  );
  const deferredGroup5 = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_5_TAM_HOAN_GOI_NHAP_NGU'
  );
  const exemptGroup2and4 = citizens.filter(
    (c) =>
      c.DIEN_QUAN_LY_NVQS === 'NHOM_2_MIEN_DANG_KY' ||
      c.DIEN_QUAN_LY_NVQS === 'NHOM_4_MIEN_GOI_NHAP_NGU'
  );
  const completedGroup3 = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_3_HOAN_THANH_TAI_NGU'
  );
  const disqualifiedGroup1 = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_1_KHONG_DUOC_DANG_KY'
  );
  const violations = citizens.filter(
    (c) =>
      c.TRANG_THAI_DK_BIEN_DONG === 'QUA_HAN_5_NGAY' ||
      c.TINH_TRANG_CU_TRU === 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY' ||
      c.HANH_VI_VI_PHAM_NVQS
  );

  // Health checks
  const passSoTuyen = citizens.filter((c) => c.KET_LUAN_SO_TUYEN_XA === 'DAT_SO_TUYEN').length;
  const failSoTuyen = citizens.filter((c) => c.KET_LUAN_SO_TUYEN_XA === 'KHONG_DAT_SO_TUYEN').length;
  const redAlertBmiOrVision = citizens.filter((c) => {
    const isBmiFail = c.CHI_SO_BMI > 0 && (c.CHI_SO_BMI < 18.0 || c.CHI_SO_BMI > 29.9);
    const isVisionFail = (c.DO_CAN_THI_D || 0) > 1.5 || (c.DO_VIEN_THI_D || 0) > 0;
    return isBmiFail || isVisionFail;
  }).length;

  // Quota audit (TT 68/2025)
  // Calling to medical exam count: qualified group 6
  const soLuongGoiKham = qualifiedGroup6.length;
  // Reserve: e.g. volunteer or backup
  const soLuongDuPhong = Math.max(1, Math.round(cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG * 0.05));
  const quotaAudit = auditQuotasTT68({
    soLuongGoiKham,
    chiTieuPhuong: cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG,
    soLuongDuPhong,
    chiTieuGiaoQuan: cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG,
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Ban Chỉ huy Quân sự Phường · Niên độ {cauHinh.NAM_TUYEN_QUAN_HIEN_TAI}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quản lý, rà soát, thu thập dữ liệu công dân trong độ tuổi NVQS từ hiện trường khu phố đến cơ quan quân sự.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenCreateCitizen}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm hồ sơ mới</span>
          </button>
          <button
            onClick={onOpenFormsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Xuất Biểu mẫu TT 106</span>
          </button>
          <button
            onClick={onOpenPublicListsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>07 Danh sách niêm yết</span>
          </button>
          <button
            onClick={onOpenSanctionsModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Tham mưu NĐ 218</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total source */}
        <div
          onClick={() => onFilterByStatus('ALL')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tổng nguồn tuổi NVQS</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{total}</div>
          <div className="text-[11px] text-slate-400 mt-1">Nam từ 17 - 27 tuổi</div>
        </div>

        {/* 17 years old */}
        <div
          onClick={() => onFilterByStatus('TUOI_17')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Đăng ký tuổi 17</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 tabular-nums">{age17Count}</div>
          <div className="text-[11px] text-slate-400 mt-1">ĐK lần đầu tháng 4 (Đ.16)</div>
        </div>

        {/* Qualified Group 6 */}
        <div
          onClick={() => onFilterByStatus('NHOM_6')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Đủ ĐK gọi khám/nhập ngũ</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">{qualifiedGroup6.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Chỉ tiêu: <strong className="text-slate-700">{cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG}</strong>
          </div>
        </div>

        {/* Deferred Group 5 */}
        <div
          onClick={() => onFilterByStatus('NHOM_5')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Tạm hoãn gọi nhập ngũ</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">{deferredGroup5.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Học vấn, gia cảnh, SK</div>
        </div>

        {/* Exempt & Completed Groups 2, 3, 4 */}
        <div
          onClick={() => onFilterByStatus('MIEN_HOAN_THANH')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Miễn & Hoàn thành</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 tabular-nums">
            {exemptGroup2and4.length + completedGroup3.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Miễn: {exemptGroup2and4.length} · DQTT: {completedGroup3.length}
          </div>
        </div>

        {/* Violations & Disqualified */}
        <div
          onClick={() => onFilterByStatus('CANH_BAO')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Cảnh báo / VPHC</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            {violations.length + redAlertBmiOrVision}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">VPHC Đ.8 & Chốt chặn TT68</div>
        </div>
      </div>

      {/* Quota & Legal Guard Controls (Circular 68/2025/TT-BQP & Circular 105/2023) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Quota threshold check per Circular 68/2025 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Kiểm soát Tỷ lệ Gọi khám sức khỏe
                </h3>
              </div>
              <span className="text-xs text-slate-500">TT 68/2025/TT-BQP</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Quy định tại Điểm đ Khoản 2 và Điểm c Khoản 3 Điều 6: Số lượng gọi khám sức khỏe không quá{' '}
              <strong>04 lần (400%)</strong> so với chỉ tiêu giao quân.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chỉ tiêu phường được giao:</span>
                <span className="font-bold text-slate-800 tabular-nums">{cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG} công dân</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Số lượng lập danh sách gọi khám:</span>
                <span className="font-bold text-emerald-700 tabular-nums">
                  {quotaAudit.soLuongGoiKham} ({quotaAudit.tyLeGoiKhamPercent}%)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Mức trần cho phép (400%):</span>
                <span className="font-semibold text-slate-600 tabular-nums">
                  Tối đa {cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG * 4} công dân
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  quotaAudit.vuotTyLeGoiKham ? 'bg-rose-600' : 'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (quotaAudit.tyLeGoiKhamPercent / 400) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {quotaAudit.vuotTyLeGoiKham ? (
              <p className="text-xs text-rose-700 font-medium flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>Vượt quá tỷ lệ 400%! Cần giảm số lượng gọi khám trước khi phát lệnh.</span>
              </p>
            ) : (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tỷ lệ gọi khám chuẩn mực ({quotaAudit.tyLeGoiKhamPercent}% &le; 400%).</span>
              </p>
            )}
          </div>
        </div>

        {/* Card 2: Reserve & Replacement ratio check per Circular 68/2025 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Tỷ lệ Dự phòng & Bù đổi Sau giao quân
                </h3>
              </div>
              <span className="text-xs text-slate-500">Đ.6 K.2 TT 68/2025</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Quyết định gọi nhập ngũ có tỷ lệ dự phòng <strong>không quá 5%</strong>; Tỷ lệ bù đổi tại đơn vị trong 10-15 ngày sau giao quân <strong>không quá 2%</strong>.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chỉ tiêu chính thức:</span>
                <span className="font-bold text-slate-800 tabular-nums">{cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG} đồng chí</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Quân số dự phòng dự kiến:</span>
                <span className="font-bold text-blue-700 tabular-nums">
                  {quotaAudit.soLuongDuPhong} đồng chí ({quotaAudit.tyLeDuPhongPercent}%)
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Trần bù đổi tối đa (2%):</span>
                <span className="font-semibold text-slate-600 tabular-nums">
                  Tối đa {Math.max(1, Math.round(cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG * 0.02))} đồng chí
                </span>
              </div>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all ${
                  quotaAudit.vuotTyLeDuPhong ? 'bg-rose-600' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, (quotaAudit.tyLeDuPhongPercent / 5) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            {quotaAudit.vuotTyLeDuPhong ? (
              <p className="text-xs text-rose-700 font-medium flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>Tỷ lệ dự phòng {quotaAudit.tyLeDuPhongPercent}% vượt quá 5%!</span>
              </p>
            ) : (
              <p className="text-xs text-blue-700 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Dự phòng đạt {quotaAudit.tyLeDuPhongPercent}% (Hợp lệ theo quy định &le; 5%).</span>
              </p>
            )}
          </div>
        </div>

        {/* Card 3: Health Screening & Red Warnings Filter */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-700" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Chốt chặn Y tế Quân sự (TT 68/2025)
                </h3>
              </div>
              <span className="text-xs text-slate-500">Khoa khám & Trạm YT</span>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Tự động cảnh báo đỏ công dân mắc tật khúc xạ cận thị &gt; 1.5D, viễn thị mọi mức độ, hoặc BMI &lt; 18.0 / &gt; 29.9.
            </p>

            <div className="grid grid-cols-2 gap-2 text-center mb-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="text-lg font-bold text-emerald-800 tabular-nums">{passSoTuyen}</div>
                <div className="text-[11px] text-emerald-700">Đạt sơ tuyển cấp xã</div>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="text-lg font-bold text-rose-800 tabular-nums">{failSoTuyen}</div>
                <div className="text-[11px] text-rose-700">Không đạt sơ tuyển</div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Trường hợp vướng chốt chặn TT 68:</span>
              <span className="font-bold text-rose-600 tabular-nums">{redAlertBmiOrVision} công dân</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Mẫu biểu TT 106/2025:</span>
            <button
              onClick={onOpenFormsModal}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Xem Mẫu 2 & Mẫu 3</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Neighborhood Distribution Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="font-semibold text-slate-900 text-sm mb-3">
          Phân bố nguồn công dân theo từng Khu phố
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {cauHinh.DANH_SACH_KHU_PHO.map((kp) => {
            const count = citizens.filter((c) => c.MA_KHU_PHO === kp.ma).length;
            const qualified = citizens.filter(
              (c) => c.MA_KHU_PHO === kp.ma && c.DIEN_QUAN_LY_NVQS === 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU'
            ).length;
            return (
              <div key={kp.ma} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-700">{kp.ten}</div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-slate-900 tabular-nums">{count}</span>
                  <span className="text-[11px] text-emerald-700 font-medium tabular-nums">
                    {qualified} đủ ĐK
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Khu đội phụ trách</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
