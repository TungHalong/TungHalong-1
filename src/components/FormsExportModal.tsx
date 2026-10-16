import React, { useState } from 'react';
import { X, Printer, Download, FileSpreadsheet, Eye, ChevronRight } from 'lucide-react';
import { CongDan, ThanNhan, CauHinhHeThong } from '../types/nvqs.ts';

interface FormsExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizens: CongDan[];
  allThanNhan: ThanNhan[];
  cauHinh: CauHinhHeThong;
  selectedCitizenId?: string;
}

export const FormsExportModal: React.FC<FormsExportModalProps> = ({
  isOpen,
  onClose,
  citizens,
  allThanNhan,
  cauHinh,
  selectedCitizenId,
}) => {
  const [selectedForm, setSelectedForm] = useState<string>('MAU_2'); // MAU_2, MAU_3, MAU_2A, MAU_2K, MAU_2L, LY_LICH
  const [activeCitizenId, setActiveCitizenId] = useState<string>(
    selectedCitizenId || citizens[0]?.MA_HO_SO || ''
  );

  const currentCitizen = citizens.find((c) => c.MA_HO_SO === activeCitizenId) || citizens[0];
  const citizenThanNhan = allThanNhan.filter((tn) => tn.MA_HO_SO === currentCitizen?.MA_HO_SO);
  const cha = citizenThanNhan.find((tn) => tn.LOAI_QUAN_HE === 'CHA_DE');
  const me = citizenThanNhan.find((tn) => tn.LOAI_QUAN_HE === 'ME_DE');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    // Export Sổ thống kê 2k/2l to CSV
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'STT,Ma Ho So,Ho Va Ten,Ngay Sinh,So CCCD,Dia Chi,Chieu Cao (cm),Can Nang (kg),Vong Nguc (cm),Ket Luan So Tuyen,Dien NVQS\n';
    citizens.forEach((c, idx) => {
      csvContent += `${idx + 1},"${c.MA_HO_SO}","${c.HO_TEN}","${c.NGAY_SINH}","${c.SO_CCCD}","${c.CHO_O_HIEN_NAY}",${c.CHIEU_CAO_CM},${c.CAN_NANG_KG},${c.VONG_NGUC_TB_CM},"${c.KET_LUAN_SO_TUYEN_XA}","${c.DIEN_QUAN_LY_NVQS}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `So_Thong_Ke_NVQS_TT106_${cauHinh.NAM_TUYEN_QUAN_HIEN_TAI}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div>
            <h2 className="font-bold text-base text-yellow-400">
              Bộ Biểu mẫu Y tế – Quân sự Chuẩn Thông tư số 106/2025/TT-BQP & 105/2023
            </h2>
            <p className="text-xs text-slate-300">
              Tự động trích xuất và điền đầy đủ dữ liệu từ bảng CONG_DAN và THAN_NHAN
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Xuất Excel/CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In ấn (A4)</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng biểu mẫu"
              className="p-1 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Selector Tabs (No print) */}
        <div className="p-3 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setSelectedForm('MAU_2')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedForm === 'MAU_2'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mẫu 2: Phiếu sơ tuyển SK
            </button>
            <button
              onClick={() => setSelectedForm('MAU_3')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedForm === 'MAU_3'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mẫu 3: Phiếu sức khỏe NVQS (4x6)
            </button>
            <button
              onClick={() => setSelectedForm('MAU_2A')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedForm === 'MAU_2A'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mẫu 2a: Báo cáo sơ tuyển (Trạm YT)
            </button>
            <button
              onClick={() => setSelectedForm('MAU_2K')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedForm === 'MAU_2K'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mẫu 2k: Sổ thống kê sơ tuyển
            </button>
            <button
              onClick={() => setSelectedForm('MAU_2L')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                selectedForm === 'MAU_2L'
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Mẫu 2l: Sổ thống kê KSK
            </button>
          </div>

          {/* Citizen switcher for single-person forms */}
          {(selectedForm === 'MAU_2' || selectedForm === 'MAU_3') && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-600 font-medium">Chọn công dân:</span>
              <select
                value={activeCitizenId}
                onChange={(e) => setActiveCitizenId(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800"
              >
                {citizens.map((c) => (
                  <option key={c.MA_HO_SO} value={c.MA_HO_SO}>
                    {c.HO_TEN} ({c.MA_HO_SO})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Printable Document Sheet */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-200 flex justify-center">
          <div className="w-full max-w-[800px] bg-white min-h-[1050px] p-8 sm:p-12 shadow-md text-slate-900 text-sm leading-relaxed border border-slate-200 print:border-none print:shadow-none print:p-0">
            {/* 1. MẪU 2: PHIẾU SƠ TUYỂN SỨC KHỎE NVQS */}
            {selectedForm === 'MAU_2' && currentCitizen && (
              <div className="space-y-6">
                <div className="text-right text-xs font-medium text-slate-600 italic">
                  Mẫu 2 (Phụ lục I – Thông tư 106/2025/TT-BQP)
                </div>

                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <p className="text-xs uppercase font-semibold">UBND CẤP XÃ / PHƯỜNG</p>
                    <p className="text-xs font-semibold">TỔ SƠ TUYỂN SỨC KHỎE</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-xs font-medium underline">Độc lập - Tự do - Hạnh phúc</p>
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      ..., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                    </p>
                  </div>
                </div>

                <div className="text-center my-4">
                  <h1 className="text-lg font-bold uppercase tracking-tight">
                    PHIẾU SƠ TUYỂN SỨC KHỎE NGHĨA VỤ QUÂN SỰ
                  </h1>
                  <p className="text-xs text-slate-500">Mã hồ sơ: <span className="font-mono font-bold text-slate-800">{currentCitizen.MA_HO_SO}</span></p>
                </div>

                {/* Phần I: Sơ yếu lý lịch */}
                <div>
                  <h2 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 mb-3">
                    I. SƠ YẾU LÝ LỊCH
                  </h2>
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>Họ và tên: <strong className="font-semibold">{currentCitizen.HO_TEN}</strong></div>
                    <div>Ngày, tháng, năm sinh: <strong className="font-mono">{currentCitizen.NGAY_SINH}</strong></div>
                    <div>Số CCCD/Định danh: <strong className="font-mono">{currentCitizen.SO_CCCD}</strong></div>
                    <div>Giới tính: <strong>{currentCitizen.GIOI_TINH === 'NAM' ? 'Nam' : 'Nữ'}</strong> · Dân tộc: <strong>{currentCitizen.DAN_TOC}</strong></div>
                    <div>Nghề nghiệp: <strong>{currentCitizen.NGHE_NGHIEP}</strong></div>
                    <div>Trình độ văn hóa: <strong>{currentCitizen.TRINH_DO_VAN_HOA}</strong></div>
                    <div>Họ và tên bố: <strong>{cha?.HO_TEN_THAN_NHAN || '................................'}</strong> (Năm sinh: {cha?.NAM_SINH || '....'})</div>
                    <div>Họ và tên mẹ: <strong>{me?.HO_TEN_THAN_NHAN || '................................'}</strong> (Năm sinh: {me?.NAM_SINH || '....'})</div>
                    <div className="col-span-2">Nơi đăng ký thường trú: <strong>{currentCitizen.NOI_DKTT}</strong></div>
                    <div className="col-span-2">Chỗ ở hiện nay: <strong>{currentCitizen.CHO_O_HIEN_NAY}</strong></div>
                  </div>
                </div>

                {/* Phần II: Kết quả sơ tuyển sức khỏe */}
                <div>
                  <h2 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 mb-3">
                    II. KẾT QUẢ SƠ TUYỂN SỨC KHỎE
                  </h2>
                  <div className="grid grid-cols-2 gap-y-2 text-xs mb-3">
                    <div>Chiều cao: <strong className="font-mono">{currentCitizen.CHIEU_CAO_CM} cm</strong></div>
                    <div>Cân nặng: <strong className="font-mono">{currentCitizen.CAN_NANG_KG} kg</strong> (BMI: <strong className="font-mono">{currentCitizen.CHI_SO_BMI}</strong>)</div>
                    <div>Vòng ngực trung bình: <strong className="font-mono">{currentCitizen.VONG_NGUC_TB_CM} cm</strong></div>
                    <div>Huyết áp: <strong className="font-mono">{currentCitizen.HUYET_AP_MMHG || '120/80'} mmHg</strong> · Mạch: <strong className="font-mono">{currentCitizen.MACH_LAN_PHUT || '75'} l/p</strong></div>
                    <div className="col-span-2">
                      Thị lực không kính: Mắt phải: <strong className="font-mono">{currentCitizen.THI_LUC_KHONG_KINH_MP}/10</strong>; Mắt trái: <strong className="font-mono">{currentCitizen.THI_LUC_KHONG_KINH_MT}/10</strong>; Cận thị: <strong className="font-mono">{currentCitizen.DO_CAN_THI_D || 0}D</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded border border-slate-200">
                    <div>Tiền sử bệnh tật gia đình: <strong>{currentCitizen.TIEN_SU_BENH_GIA_DINH || 'Bình thường'}</strong></div>
                    <div>Tiền sử bệnh tật bản thân: <strong>{currentCitizen.TIEN_SU_BENH_BAN_THAN || 'Bình thường'}</strong></div>
                    <div>Đặc điểm dị tật, hình xăm: <strong>{currentCitizen.DAC_DIEM_HINH_XAM || 'Không có'}</strong></div>
                    <div>Chẩn đoán tâm thần: <strong>Bình thường (Trầm cảm {currentCitizen.DIEM_TRAM_CAM}đ · Hưng cảm {currentCitizen.DIEM_HUNG_CAM}đ)</strong></div>
                  </div>
                </div>

                {/* Phần III: Ý kiến Tổ sơ tuyển */}
                <div>
                  <h2 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 mb-2">
                    III. Ý KIẾN TỔ SƠ TUYỂN
                  </h2>
                  <p className="text-xs">
                    Kết luận sơ tuyển: <strong className={currentCitizen.KET_LUAN_SO_TUYEN_XA === 'DAT_SO_TUYEN' ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                      {currentCitizen.KET_LUAN_SO_TUYEN_XA === 'DAT_SO_TUYEN' ? 'ĐỦ ĐIỀU KIỆN KHÁM SỨC KHỎE KHU VỰC' : 'KHÔNG ĐỦ ĐIỀU KIỆN SƠ TUYỂN'}
                    </strong>
                  </p>
                  {currentCitizen.LY_DO_SO_TUYEN && (
                    <p className="text-xs text-slate-600 mt-1">Lý do: {currentCitizen.LY_DO_SO_TUYEN}</p>
                  )}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 text-center text-xs pt-6">
                  <div>
                    <p className="font-bold">CÁN BỘ SƠ TUYỂN</p>
                    <p className="italic text-slate-500">(Ký, ghi rõ họ tên)</p>
                    <div className="h-16"></div>
                    <p className="font-semibold">Bác sĩ Lê Thị Mai</p>
                  </div>
                  <div>
                    <p className="font-bold">TỔ TRƯỞNG TỔ SƠ TUYỂN</p>
                    <p className="italic text-slate-500">(Ký, đóng dấu)</p>
                    <div className="h-16"></div>
                    <p className="font-semibold">Trung tá Trần Văn Nam</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MẪU 3: PHIẾU SỨC KHỎE NVQS (CÓ KHUNG ẢNH 4X6) */}
            {selectedForm === 'MAU_3' && currentCitizen && (
              <div className="space-y-6">
                <div className="text-right text-xs font-medium text-slate-600 italic">
                  Mẫu 3 (Phụ lục I – Thông tư 106/2025/TT-BQP)
                </div>

                <div className="flex justify-between items-start border-b pb-4">
                  <div className="flex gap-4">
                    {/* Ảnh 4x6 cm */}
                    <div className="w-[85px] h-[120px] border-2 border-dashed border-slate-400 rounded flex flex-col items-center justify-center bg-slate-50 overflow-hidden text-center">
                      {currentCitizen.ID_ANH_THE_4X6 ? (
                        <img
                          src={currentCitizen.ID_ANH_THE_4X6}
                          alt="Ảnh 4x6"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Ảnh 4×6 cm<br />(Đóng dấu giáp lai)
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase font-semibold">TỈNH / THÀNH PHỐ: TP. HỒ CHÍ MINH</p>
                      <p className="text-xs font-semibold">BAN CHỈ HUY QUÂN SỰ PHƯỜNG</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="text-xs font-medium underline">Độc lập - Tự do - Hạnh phúc</p>
                  </div>
                </div>

                <div className="text-center my-3">
                  <h1 className="text-lg font-bold uppercase tracking-tight">
                    PHIẾU SỨC KHỎE NGHĨA VỤ QUÂN SỰ
                  </h1>
                  <p className="text-xs text-slate-500">Mã hồ sơ: <span className="font-mono font-bold text-slate-800">{currentCitizen.MA_HO_SO}</span></p>
                </div>

                {/* Sơ yếu lý lịch */}
                <div>
                  <h2 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 mb-2">
                    I. SƠ YẾU LÝ LỊCH (Do Ban CHQS cấp xã lập)
                  </h2>
                  <div className="grid grid-cols-2 gap-y-1.5 text-xs">
                    <div>Họ và tên: <strong className="font-semibold">{currentCitizen.HO_TEN}</strong></div>
                    <div>Ngày tháng năm sinh: <strong className="font-mono">{currentCitizen.NGAY_SINH}</strong></div>
                    <div>Số CCCD: <strong className="font-mono">{currentCitizen.SO_CCCD}</strong></div>
                    <div>Dân tộc: <strong>{currentCitizen.DAN_TOC}</strong> · Tôn giáo: <strong>{currentCitizen.TON_GIAO}</strong></div>
                    <div>Họ tên bố: <strong>{cha?.HO_TEN_THAN_NHAN || '................................'}</strong> ({cha?.NAM_SINH || '....'})</div>
                    <div>Họ tên mẹ: <strong>{me?.HO_TEN_THAN_NHAN || '................................'}</strong> ({me?.NAM_SINH || '....'})</div>
                    <div className="col-span-2">Nơi ĐKTT: <strong>{currentCitizen.NOI_DKTT}</strong></div>
                    <div className="col-span-2">Chỗ ở hiện nay: <strong>{currentCitizen.CHO_O_HIEN_NAY}</strong></div>
                  </div>
                </div>

                {/* Kết quả KSK */}
                <div>
                  <h2 className="font-bold uppercase text-xs border-b border-slate-300 pb-1 mb-2">
                    II. KẾT QUẢ KHÁM SỨC KHỎE NGHĨA VỤ QUÂN SỰ (Hội đồng KSK Khu vực)
                  </h2>
                  <table className="w-full text-xs border border-slate-300 border-collapse mb-3">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300">
                        <th className="p-1.5 border-r border-slate-300 text-left">Chỉ tiêu khám</th>
                        <th className="p-1.5 border-r border-slate-300 w-16 text-center">Điểm</th>
                        <th className="p-1.5 border-r border-slate-300 text-left">Chỉ số đo đạc & Lý do</th>
                        <th className="p-1.5 text-left w-36">Bác sĩ khám</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">1. Thể lực</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold">1</td>
                        <td className="p-1.5 border-r border-slate-300">
                          Cao: {currentCitizen.CHIEU_CAO_CM}cm; Nặng: {currentCitizen.CAN_NANG_KG}kg; BMI: {currentCitizen.CHI_SO_BMI}; Ngực: {currentCitizen.VONG_NGUC_TB_CM}cm
                        </td>
                        <td className="p-1.5">BS. Nguyễn Văn Hào</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">2. Mắt & Thị lực</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                          {(currentCitizen.DO_CAN_THI_D || 0) > 1.5 ? '4' : '1'}
                        </td>
                        <td className="p-1.5 border-r border-slate-300">
                          MP: {currentCitizen.THI_LUC_KHONG_KINH_MP}/10; MT: {currentCitizen.THI_LUC_KHONG_KINH_MT}/10; Cận: {currentCitizen.DO_CAN_THI_D || 0}D
                        </td>
                        <td className="p-1.5">BS. Trần Quốc Tuấn</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">3. Tai - Mũi - Họng</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold">1</td>
                        <td className="p-1.5 border-r border-slate-300">Sức nghe 5m, không viêm tai xương chũm</td>
                        <td className="p-1.5">BS. Phạm Thị Lan</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">4. Răng - Hàm - Mặt</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold">1</td>
                        <td className="p-1.5 border-r border-slate-300">Đủ 28 răng tốt, khớp cắn chuẩn</td>
                        <td className="p-1.5">BS. Lê Đình Cẩn</td>
                      </tr>
                      <tr>
                        <td className="p-1.5 border-r border-slate-300 font-medium">5. Nội khoa & Thần kinh</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold">1</td>
                        <td className="p-1.5 border-r border-slate-300">
                          HA: {currentCitizen.HUYET_AP_MMHG || '120/80'}; Mạch: {currentCitizen.MACH_LAN_PHUT || 75} l/p; Không rối loạn cảm xúc
                        </td>
                        <td className="p-1.5">BS. Hoàng Văn Kiên</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="p-2 bg-slate-50 border border-slate-300 rounded text-xs flex justify-between items-center">
                    <span>Phân loại sức khỏe chung: <strong>LOẠI 1 (ĐẠT TIÊU CHUẨN PHỤC VỤ TẠI NGŨ)</strong></span>
                    <span className="font-semibold text-emerald-700">ĐỦ ĐIỀU KIỆN NHẬP NGŨ</span>
                  </div>
                </div>

                {/* Chữ ký công dân xác thực */}
                {currentCitizen.ID_ANH_CHU_KY && (
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200">
                    <div>
                      <p className="font-medium text-slate-700">Chữ ký số xác nhận của công dân:</p>
                      <img src={currentCitizen.ID_ANH_CHU_KY} alt="Chữ ký" className="h-10 mt-1 object-contain" />
                    </div>
                    {currentCitizen.TOA_DO_GPS && (
                      <div className="text-right text-[11px] text-slate-500 font-mono">
                        GPS: {currentCitizen.TOA_DO_GPS.lat}, {currentCitizen.TOA_DO_GPS.lng} (±{currentCitizen.TOA_DO_GPS.accuracy}m)
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. MẪU 2A: BÁO CÁO SƠ TUYỂN CỦA TRẠM Y TẾ */}
            {selectedForm === 'MAU_2A' && (
              <div className="space-y-6">
                <div className="text-right text-xs font-medium text-slate-600 italic">
                  Mẫu 2a (Phụ lục II – Thông tư 106/2025/TT-BQP)
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase font-semibold">UBND CẤP XÃ / PHƯỜNG — TRẠM Y TẾ</p>
                  <h1 className="text-base font-bold uppercase mt-2">
                    BÁO CÁO KẾT QUẢ SƠ TUYỂN SỨC KHỎE NGHĨA VỤ QUÂN SỰ
                  </h1>
                  <p className="text-xs text-slate-600 italic">Năm tuyển quân: {cauHinh.NAM_TUYEN_QUAN_HIEN_TAI}</p>
                </div>

                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-semibold">
                      <th className="p-2 border-r border-slate-300 text-center w-12">TT</th>
                      <th className="p-2 border-r border-slate-300 text-left">Nội dung</th>
                      <th className="p-2 border-r border-slate-300 text-center w-28">Kết quả</th>
                      <th className="p-2 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">1</td>
                      <td className="p-2 border-r border-slate-300">Số lượng sơ tuyển sức khỏe theo kế hoạch</td>
                      <td className="p-2 border-r border-slate-300 text-center font-bold">{citizens.length}</td>
                      <td className="p-2 text-slate-500">Kế hoạch chỉ tiêu phường</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">2</td>
                      <td className="p-2 border-r border-slate-300">Số lượng đã sơ tuyển</td>
                      <td className="p-2 border-r border-slate-300 text-center font-bold">
                        {citizens.filter((c) => c.KET_LUAN_SO_TUYEN_XA !== 'CHUA_SO_TUYEN').length}
                      </td>
                      <td className="p-2">Tại Trạm Y tế phường</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">3</td>
                      <td className="p-2 border-r border-slate-300 font-semibold">
                        Số lượng đủ điều kiện khám tại tuyến khu vực
                      </td>
                      <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-700">
                        {citizens.filter((c) => c.KET_LUAN_SO_TUYEN_XA === 'DAT_SO_TUYEN').length}
                      </td>
                      <td className="p-2">Bàn giao HĐ KSK khu vực</td>
                    </tr>
                    <tr>
                      <td className="p-2 border-r border-slate-300 text-center">4</td>
                      <td className="p-2 border-r border-slate-300">Tổng số đã loại ra tại sơ tuyển</td>
                      <td className="p-2 border-r border-slate-300 text-center font-bold text-rose-700">
                        {citizens.filter((c) => c.KET_LUAN_SO_TUYEN_XA === 'KHONG_DAT_SO_TUYEN').length}
                      </td>
                      <td className="p-2">Chưa đủ thể lực / bệnh tật</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. MẪU 2K: SỔ THỐNG KÊ SƠ TUYỂN SỨC KHỎE NVQS (CÓ CỘT SỐ CCCD MỚI BỔ SUNG) */}
            {selectedForm === 'MAU_2K' && (
              <div className="space-y-4">
                <div className="text-right text-xs font-medium text-slate-600 italic">
                  Mẫu 2k (Phụ lục II – Thông tư 106/2025/TT-BQP)
                </div>
                <div className="text-center">
                  <h1 className="text-base font-bold uppercase">
                    SỔ THỐNG KÊ SƠ TUYỂN SỨC KHỎE NGHĨA VỤ QUÂN SỰ
                  </h1>
                  <p className="text-xs text-slate-500 italic">Áp dụng cho cấp xã/phường - Có bổ sung cột Số CCCD theo TT 106/2025</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border border-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-center">
                        <th className="p-1 border-r border-slate-300 w-8">TT</th>
                        <th className="p-1 border-r border-slate-300 text-left">Họ và tên</th>
                        <th className="p-1 border-r border-slate-300 w-20">Ngày sinh</th>
                        <th className="p-1 border-r border-slate-300 text-left">Địa chỉ</th>
                        <th className="p-1 border-r border-slate-300 bg-amber-50 text-amber-900 font-bold w-24">Số CCCD</th>
                        <th className="p-1 border-r border-slate-300 w-12">Cao (cm)</th>
                        <th className="p-1 border-r border-slate-300 w-12">Nặng (kg)</th>
                        <th className="p-1 border-r border-slate-300 text-left">Tình trạng bệnh tật</th>
                        <th className="p-1 border-r border-slate-300 w-16">Đủ ĐK</th>
                        <th className="p-1 w-20">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {citizens.map((c, idx) => (
                        <tr key={c.MA_HO_SO}>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-1 border-r border-slate-300 font-semibold">{c.HO_TEN}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.NGAY_SINH}</td>
                          <td className="p-1 border-r border-slate-300 truncate max-w-[120px]">{c.CHO_O_HIEN_NAY}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono bg-amber-50/50">{c.SO_CCCD}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.CHIEU_CAO_CM}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.CAN_NANG_KG}</td>
                          <td className="p-1 border-r border-slate-300">{c.TIEN_SU_BENH_BAN_THAN || 'Bình thường'}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-bold">
                            {c.KET_LUAN_SO_TUYEN_XA === 'DAT_SO_TUYEN' ? 'Đạt' : 'Loại'}
                          </td>
                          <td className="p-1 text-[10px] text-slate-500">{c.LY_DO_SO_TUYEN || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. MẪU 2L: SỔ THỐNG KÊ KHÁM SỨC KHỎE NVQS */}
            {selectedForm === 'MAU_2L' && (
              <div className="space-y-4">
                <div className="text-right text-xs font-medium text-slate-600 italic">
                  Mẫu 2l (Phụ lục II – Thông tư 106/2025/TT-BQP)
                </div>
                <div className="text-center">
                  <h1 className="text-base font-bold uppercase">
                    SỔ THỐNG KÊ KHÁM SỨC KHỎE NGHĨA VỤ QUÂN SỰ
                  </h1>
                  <p className="text-xs text-slate-500 italic">Cho Ban CHQS cấp xã và Ban Chỉ huy phòng thủ khu vực</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px] border border-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-center">
                        <th className="p-1 border-r border-slate-300 w-8">TT</th>
                        <th className="p-1 border-r border-slate-300 text-left">Họ và tên</th>
                        <th className="p-1 border-r border-slate-300 w-20">Ngày sinh</th>
                        <th className="p-1 border-r border-slate-300 w-24">Số CCCD</th>
                        <th className="p-1 border-r border-slate-300 w-12">Cao</th>
                        <th className="p-1 border-r border-slate-300 w-12">Nặng</th>
                        <th className="p-1 border-r border-slate-300 text-left">Tình trạng bệnh</th>
                        <th className="p-1 border-r border-slate-300 w-8">L1</th>
                        <th className="p-1 border-r border-slate-300 w-8">L2</th>
                        <th className="p-1 border-r border-slate-300 w-8">L3</th>
                        <th className="p-1 border-r border-slate-300 w-8">L4</th>
                        <th className="p-1 border-r border-slate-300 w-8">L5</th>
                        <th className="p-1 w-8">L6</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {citizens.map((c, idx) => (
                        <tr key={c.MA_HO_SO}>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-1 border-r border-slate-300 font-semibold">{c.HO_TEN}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.NGAY_SINH}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.SO_CCCD}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.CHIEU_CAO_CM}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.CAN_NANG_KG}</td>
                          <td className="p-1 border-r border-slate-300 truncate max-w-[100px]">{c.TIEN_SU_BENH_BAN_THAN || 'Bình thường'}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.PHAN_LOAI_KSK_KHU_VUC === 'LOAI_1' ? 'X' : ''}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.PHAN_LOAI_KSK_KHU_VUC === 'LOAI_2' ? 'X' : ''}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.PHAN_LOAI_KSK_KHU_VUC === 'LOAI_3' ? 'X' : ''}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.PHAN_LOAI_KSK_KHU_VUC === 'LOAI_4' ? 'X' : ''}</td>
                          <td className="p-1 border-r border-slate-300 text-center font-mono">{c.PHAN_LOAI_KSK_KHU_VUC === 'LOAI_5' ? 'X' : ''}</td>
                          <td className="p-1 text-center font-mono">{c.PHAN_LOAI_KSK_KHU_VUC === 'LOAI_6' ? 'X' : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
