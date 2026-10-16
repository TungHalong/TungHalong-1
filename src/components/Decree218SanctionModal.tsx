import React, { useState } from 'react';
import {
  X,
  Scale,
  AlertTriangle,
  CheckCircle,
  FileText,
  Printer,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Phone,
  Calendar,
} from 'lucide-react';
import { CongDan } from '../types/nvqs.ts';
import { DANH_MUC_VI_PHAM_ND218, isThanNhanHopPhapND218 } from '../utils/nvqsRules.ts';

interface Decree218SanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizen?: CongDan;
  citizens: CongDan[];
  onApplyViolation: (citizenId: string, violationData: any) => void;
}

export const Decree218SanctionModal: React.FC<Decree218SanctionModalProps> = ({
  isOpen,
  onClose,
  citizen,
  citizens,
  onApplyViolation,
}) => {
  const [selectedCitizenId, setSelectedCitizenId] = useState<string>(
    citizen?.MA_HO_SO || citizens[0]?.MA_HO_SO || ''
  );
  const [step, setStep] = useState<number>(1); // 1: Kiểm tra lý do chính đáng, 2: Định khung & Thẩm quyền, 3: Kết xuất biên bản & DVC

  // Form states
  const [hasLegitReason, setHasLegitReason] = useState<boolean>(false);
  const [legitReasonDetail, setLegitReasonDetail] = useState<string>('');
  const [hasCertificate, setHasCertificate] = useState<boolean>(false);

  const [violationKey, setViolationKey] = useState<string>('D8_K2');
  const [violationDate, setViolationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [specificFine, setSpecificFine] = useState<number>(9000000); // 9 triệu trung bình

  const targetCitizen =
    citizens.find((c) => c.MA_HO_SO === selectedCitizenId) || citizens[0];
  const violationInfo = DANH_MUC_VI_PHAM_ND218[violationKey];

  if (!isOpen || !targetCitizen) return null;

  const handleSelectViolation = (key: string) => {
    setViolationKey(key);
    const info = DANH_MUC_VI_PHAM_ND218[key];
    if (info) {
      const avg = Math.round((info.mucPhatMin + info.mucPhatMax) / 2);
      setSpecificFine(avg);
    }
  };

  const handleFinish = () => {
    onApplyViolation(targetCitizen.MA_HO_SO, {
      HANH_VI_VI_PHAM_NVQS: violationInfo.hanhVi,
      KHUNG_PHAT_TIEN_ND218: `${specificFine.toLocaleString('vi-VN')} đ (${violationInfo.dieuKhoan})`,
      THAM_QUYEN_XU_PHAT: violationInfo.thamQuyen,
      CO_LY_DO_CHINH_DANG: hasLegitReason && hasCertificate,
      CHI_TIET_LY_DO_CHINH_DANG: legitReasonDetail,
      TRANG_THAI_XU_PHAT: 'LAP_BIEN_BAN',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-sm sm:text-base text-yellow-400">
                Công cụ Tham mưu Xử phạt Vi phạm Hành chính NVQS
              </h2>
              <p className="text-xs text-slate-300">
                Nghị định số 218/2025/NĐ-CP & Luật NVQS hợp nhất năm 2026
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Đóng công cụ xử phạt" className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs no-print">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Đối tượng:</span>
            <select
              value={targetCitizen.MA_HO_SO}
              onChange={(e) => setSelectedCitizenId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 font-semibold text-slate-800"
            >
              {citizens.map((c) => (
                <option key={c.MA_HO_SO} value={c.MA_HO_SO}>
                  {c.HO_TEN} ({c.MA_HO_SO} - {c.MA_KHU_PHO})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1 rounded font-semibold ${
                step === 1 ? 'bg-amber-600 text-white' : 'bg-white text-slate-600'
              }`}
            >
              Bước 1: Lý do chính đáng
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => setStep(2)}
              className={`px-3 py-1 rounded font-semibold ${
                step === 2 ? 'bg-amber-600 text-white' : 'bg-white text-slate-600'
              }`}
            >
              Bước 2: Định khung & Thẩm quyền
            </button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => setStep(3)}
              className={`px-3 py-1 rounded font-semibold ${
                step === 3 ? 'bg-amber-600 text-white' : 'bg-white text-slate-600'
              }`}
            >
              Bước 3: Biên bản & Cổng DVC
            </button>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* BƯỚC 1: KIỂM TRA LÝ DO CHÍNH ĐÁNG */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  Quy định Chốt chặn: Kiểm tra Điều kiện "Lý do chính đáng"
                </h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Căn cứ <strong>Khoản 1 Điều 3 Nghị định 218/2025/NĐ-CP</strong> và Khoản 5 Điều 35 Luật NVQS:
                  Người vắng mặt có lý do chính đáng là việc bản thân hoặc thân nhân hợp pháp (Cha đẻ, mẹ đẻ; cha/mẹ vợ/chồng; cha/mẹ nuôi; người nuôi dưỡng hợp pháp; vợ/chồng; con đẻ, con nuôi) bị ốm đau, tai nạn nặng điều trị tại cơ sở y tế; gia đình có tang lễ; hoặc gặp thiên tai, hỏa hoạn, dịch bệnh và <strong>bắt buộc phải có giấy xác nhận của UBND cấp xã hoặc cơ sở y tế có thẩm quyền</strong>.
                </p>
              </div>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasLegit"
                    checked={hasLegitReason}
                    onChange={(e) => setHasLegitReason(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="hasLegit" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Công dân hoặc thân nhân hợp pháp có lý do khách quan (ốm đau nặng, tai nạn, tang lễ, thiên tai)
                  </label>
                </div>

                {hasLegitReason && (
                  <div className="space-y-3 pl-6 pt-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Chi tiết tình trạng và đối tượng thân nhân:
                      </label>
                      <textarea
                        rows={2}
                        value={legitReasonDetail}
                        onChange={(e) => setLegitReasonDetail(e.target.value)}
                        placeholder="Ví dụ: Mẹ đẻ bị tai nạn giao thông điều trị nội trú tại Bệnh viện Nhân dân Gia Định..."
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="hasCert"
                        checked={hasCertificate}
                        onChange={(e) => setHasCertificate(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <label htmlFor="hasCert" className="text-xs text-slate-700 cursor-pointer">
                        Đã có Giấy xác nhận của UBND cấp xã nơi cư trú hoặc giấy ra viện/xác nhận của cơ sở y tế (Hợp lệ)
                      </label>
                    </div>

                    {hasLegitReason && hasCertificate && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>Đủ điều kiện Lý do chính đáng:</strong> Miễn áp dụng chế tài xử phạt VPHC theo NĐ 218/2025. Ban CHQS hướng dẫn công dân gia hạn đăng ký/khám sức khỏe đợt sau.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {(!hasLegitReason || !hasCertificate) && (
                  <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      Không có lý do chính đáng hoặc không có xác nhận hợp lệ: Tiến hành Bước 2 để định khung xử phạt vi phạm hành chính.
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <span>Chuyển sang Bước 2: Định khung phạt</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 2: ĐỊNH KHUNG PHẠT VÀ THẨM QUYỀN */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Chọn Hành vi Vi phạm theo Nghị định 218/2025/NĐ-CP:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(DANH_MUC_VI_PHAM_ND218).map(([key, item]) => {
                  const isSelected = violationKey === key;
                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectViolation(key)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="font-bold text-slate-900">{item.dieuKhoan}</span>
                        <span className="font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          {item.khungPhatText}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed line-clamp-3">{item.hanhVi}</p>
                    </div>
                  );
                })}
              </div>

              {/* Selected fine summary & Jurisdiction card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">Mức phạt tiền áp dụng cụ thể:</h4>
                    <p className="text-[11px] text-slate-500">Khung: {violationInfo.khungPhatText}</p>
                  </div>
                  {violationInfo.mucPhatMax > 0 && (
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={violationInfo.mucPhatMin}
                        max={violationInfo.mucPhatMax}
                        step={500000}
                        value={specificFine}
                        onChange={(e) => setSpecificFine(Number(e.target.value))}
                        className="w-36 accent-amber-600"
                      />
                      <span className="font-mono font-bold text-sm text-rose-700 tabular-nums">
                        {specificFine.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Biện pháp khắc phục hậu quả:</span>
                    <strong className="text-slate-800">{violationInfo.bienPhapKhacPhuc}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Thẩm quyền ra quyết định:</span>
                    <strong className="text-amber-900">{violationInfo.thamQuyen}</strong>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Quay lại Bước 1
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <span>Chuyển sang Bước 3: Lập Biên bản & DVC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* BƯỚC 3: DỰ THẢO BIÊN BẢN & CỔNG DỊCH VỤ CÔNG QUỐC GIA */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blue-900">
                    <Phone className="w-4 h-4 text-blue-700" />
                    Đồng bộ nộp phạt trực tuyến Cổng Dịch vụ công Quốc gia (Khoản 8 Điều 6 NĐ 218)
                  </div>
                  <span className="font-mono bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">
                    SĐT: {targetCitizen.SDT_CONG_DAN}
                  </span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Hệ thống gửi thông tin quyết định xử phạt đến Cổng Dịch vụ công Quốc gia. Công dân tra cứu qua Số điện thoại đăng ký và Số biên bản vi phạm để nộp phạt trực tuyến an toàn, minh bạch.
                </p>
                <div className="flex items-center gap-2 text-blue-950 font-medium pt-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" />
                  <span>Thời hiệu xử phạt VPHC: <strong>01 năm</strong> kể từ ngày phát hiện vi phạm (Điều 4 Nghị định 218/2025).</span>
                </div>
              </div>

              {/* Draft Sanction Notice */}
              <div className="p-6 bg-white border border-slate-300 rounded-xl text-xs space-y-4 font-serif">
                <div className="flex justify-between items-start border-b pb-3">
                  <div className="text-center font-sans">
                    <p className="font-bold text-slate-800">ỦY BAN NHÂN DÂN CẤP XÃ</p>
                    <p className="font-semibold text-slate-600">HỘI ĐỒNG NGHĨA VỤ QUÂN SỰ</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Số: .../BB-VPHC-NVQS</p>
                  </div>
                  <div className="text-center font-sans">
                    <p className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-medium underline">Độc lập - Tự do - Hạnh phúc</p>
                  </div>
                </div>

                <div className="text-center font-sans py-2">
                  <h3 className="font-bold text-sm uppercase">DỰ THẢO BIÊN BẢN VI PHẠM HÀNH CHÍNH</h3>
                  <p className="text-slate-500 text-[11px]">Về lĩnh vực Quốc phòng - Nghĩa vụ quân sự</p>
                </div>

                <p className="leading-relaxed">
                  Hôm nay, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}, tại Trụ sở Ban Chỉ huy Quân sự phường.
                </p>

                <p>
                  <strong>Người vi phạm:</strong> {targetCitizen.HO_TEN} · Sinh ngày: {targetCitizen.NGAY_SINH} · Số CCCD: {targetCitizen.SO_CCCD} · Trú tại: {targetCitizen.CHO_O_HIEN_NAY}.
                </p>

                <p>
                  <strong>Đã có hành vi vi phạm:</strong> {violationInfo.hanhVi}.
                </p>

                <p>
                  <strong>Quy định tại:</strong> {violationInfo.dieuKhoan}.
                </p>

                <p>
                  <strong>Đề xuất mức phạt tiền:</strong> <span className="font-bold text-rose-700">{specificFine.toLocaleString('vi-VN')} đồng</span>.
                </p>

                <p>
                  <strong>Biện pháp khắc phục hậu quả:</strong> {violationInfo.bienPhapKhacPhuc}.
                </p>

                <p>
                  <strong>Thẩm quyền ban hành Quyết định:</strong> {violationInfo.thamQuyen}.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Quay lại Bước 2
                </button>

                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Xác nhận Áp dụng Chế tài & Cập nhật Hồ sơ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
