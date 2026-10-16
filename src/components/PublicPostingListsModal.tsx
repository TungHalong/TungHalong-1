import React, { useState } from 'react';
import { X, Printer, Lock, Unlock, Eye, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { CongDan, CauHinhHeThong } from '../types/nvqs.ts';

interface PublicPostingListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizens: CongDan[];
  cauHinh: CauHinhHeThong;
}

export const PublicPostingListsModal: React.FC<PublicPostingListsModalProps> = ({
  isOpen,
  onClose,
  citizens,
  cauHinh,
}) => {
  const [activeListIndex, setActiveListIndex] = useState<number>(0);
  const [redactSensitiveInfo, setRedactSensitiveInfo] = useState<boolean>(true);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const lists = [
    {
      id: 'DS_1',
      title: '1. Chỉ tiêu tuyển quân tỉnh giao cho phường',
      subtitle: 'Quyết định giao chỉ tiêu gọi công dân nhập ngũ và thực hiện NV tham gia CAND năm 2026',
    },
    {
      id: 'DS_2',
      title: '2. Điều kiện, tiêu chuẩn tuyển quân; tạm hoãn & miễn',
      subtitle: 'Trích lục Điều 31, Điều 41 Luật NVQS & Điểm a Khoản 2 Điều 1 Thông tư 68/2025/TT-BQP',
    },
    {
      id: 'DS_3',
      title: '3. Danh sách công dân trong diện gọi nhập ngũ',
      subtitle: 'Công dân nam đủ 18 đến hết 25 tuổi, và đến hết 27 tuổi đối với trình độ CĐ/ĐH',
    },
    {
      id: 'DS_4',
      title: '4. Danh sách công dân tạm hoãn & miễn gọi nhập ngũ',
      subtitle: 'Theo quy định tại Điều 41 Luật NVQS và Thông tư 68/2025/TT-BQP',
    },
    {
      id: 'DS_5',
      title: '5. Danh sách công dân đủ điều kiện nhập ngũ',
      subtitle: 'Đạt tiêu chuẩn về chính trị, đạo đức, học vấn và sức khỏe loại 1, 2, 3',
    },
    {
      id: 'DS_6',
      title: '6. Kết quả sơ tuyển & phân loại sức khỏe KSK',
      subtitle: 'Kết luận của Tổ sơ tuyển sức khỏe phường và Hội đồng khám sức khỏe khu vực',
    },
    {
      id: 'DS_7',
      title: '7. Danh sách công dân trúng tuyển sẵn sàng nhập ngũ',
      subtitle: 'Chốt quân số chính thức phát lệnh gọi nhập ngũ năm 2026',
    },
  ];

  // Helper datasets
  const list3Citizens = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU' || c.DIEN_QUAN_LY_NVQS === 'NHOM_5_TAM_HOAN_GOI_NHAP_NGU'
  );

  const list4Citizens = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_5_TAM_HOAN_GOI_NHAP_NGU' || c.DIEN_QUAN_LY_NVQS === 'NHOM_4_MIEN_GOI_NHAP_NGU' || c.DIEN_QUAN_LY_NVQS === 'NHOM_2_MIEN_DANG_KY'
  );

  const list5Citizens = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU'
  );

  const list7Citizens = citizens.filter(
    (c) => c.DIEN_QUAN_LY_NVQS === 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU' && (c.CO_MU || c.CO_DON_TINH_NGUYEN)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              <h2 className="font-bold text-sm sm:text-base text-yellow-400">
                07 Danh sách Công khai & Niêm yết tối thiểu 20 ngày
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Căn cứ Điểm đ Khoản 3 Điều 6 sửa đổi tại Thông tư 68/2025/TT-BQP & Điều 35, 40, 41 Luật NVQS
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Redaction toggle */}
            <button
              onClick={() => setRedactSensitiveInfo(!redactSensitiveInfo)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                redactSensitiveInfo
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                  : 'bg-amber-950/80 border-amber-600 text-amber-300'
              }`}
              title="Tự động ẩn chi tiết bệnh án mật hoặc tiền án nhạy cảm khi niêm yết tại nơi công cộng"
            >
              {redactSensitiveInfo ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{redactSensitiveInfo ? 'Đang bảo vệ dữ liệu nhạy cảm' : 'Hiện đầy đủ chi tiết'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Niêm yết</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Đóng danh sách niêm yết"
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 7 Lists Tab Navigation */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-1 no-print">
          {lists.map((l, idx) => (
            <button
              key={l.id}
              onClick={() => setActiveListIndex(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors truncate max-w-[280px] ${
                activeListIndex === idx
                  ? 'bg-slate-900 text-white shadow'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {l.title}
            </button>
          ))}
        </div>

        {/* Notice Info Box */}
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span>
              Thời hạn niêm yết công khai: <strong>Tối thiểu 20 ngày</strong> tại Trụ sở UBND phường, Cổng thông tin điện tử và Nhà văn hóa / Nơi sinh hoạt cộng đồng các Khu phố.
            </span>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-200 flex justify-center">
          <div className="w-full max-w-[850px] bg-white min-h-[1000px] p-8 sm:p-12 shadow-md text-slate-900 text-xs leading-relaxed border border-slate-200 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4 mb-4">
              <div>
                <p className="font-semibold uppercase">ỦY BAN NHÂN DÂN CẤP XÃ / PHƯỜNG</p>
                <p className="font-bold">HỘI ĐỒNG NGHĨA VỤ QUÂN SỰ</p>
                <p className="text-[11px] text-slate-500 mt-1">Số: .../TB-HĐNVQS</p>
              </div>
              <div className="text-center">
                <p className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                <p className="font-medium underline">Độc lập - Tự do - Hạnh phúc</p>
                <p className="text-[11px] text-slate-500 italic mt-1">
                  ..., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                </p>
              </div>
            </div>

            {/* List 1 */}
            {activeListIndex === 0 && (
              <div className="space-y-4">
                <div className="text-center my-4">
                  <h1 className="text-base font-bold uppercase tracking-tight">
                    CÔNG KHAI CHỈ TIÊU TUYỂN QUÂN NĂM {cauHinh.NAM_TUYEN_QUAN_HIEN_TAI}
                  </h1>
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    (Theo Quyết định giao chỉ tiêu tuyển chọn và gọi công dân nhập ngũ)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border rounded-lg space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Tổng chỉ tiêu tỉnh giao cho cấp xã/phường:</span>
                    <strong className="text-sm font-bold text-slate-900 tabular-nums">{cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG} công dân</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Nghĩa vụ Quân sự (Bộ Quốc phòng):</span>
                    <strong className="text-slate-800 tabular-nums">{cauHinh.CHI_TIEU_GIAO_QUAN_PHUONG - 3} công dân</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Nghĩa vụ tham gia Công an nhân dân (Bộ Công an):</span>
                    <strong className="text-slate-800 tabular-nums">03 công dân</strong>
                  </div>
                  <div className="flex justify-between text-xs pt-2 border-t">
                    <span>Thời hạn tổ chức Lễ Giao nhận quân:</span>
                    <strong className="text-slate-800">Tháng 02 năm {cauHinh.NAM_TUYEN_QUAN_HIEN_TAI}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* List 2 */}
            {activeListIndex === 1 && (
              <div className="space-y-4">
                <div className="text-center my-4">
                  <h1 className="text-base font-bold uppercase tracking-tight">
                    ĐIỀU KIỆN, TIÊU CHUẨN TUYỂN QUÂN; TRƯỜNG HỢP TẠM HOÃN VÀ MIỄN GỌI NHẬP NGŨ
                  </h1>
                </div>

                <div className="space-y-3 text-slate-800">
                  <h3 className="font-bold text-xs uppercase border-b pb-1">1. Tiêu chuẩn tuyển quân (Điều 31 Luật NVQS)</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Lý lịch rõ ràng, chấp hành nghiêm đường lối của Đảng, chính sách, pháp luật của Nhà nước.</li>
                    <li>Sức khỏe: Đạt loại 1, 2, 3 theo quy định tại Thông tư 105/2023 và Thông tư 68/2025 (BMI từ 18.0 đến 29.9, không cận thị &gt; 1.5D, không viễn thị).</li>
                    <li>Trình độ văn hóa: Học vấn lớp 8/12 trở lên; ưu tiên gọi công dân tốt nghiệp CĐ, ĐH.</li>
                  </ul>

                  <h3 className="font-bold text-xs uppercase border-b pb-1 pt-2">2. Trường hợp tạm hoãn gọi nhập ngũ (Khoản 1 Điều 41 Luật NVQS)</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Chưa đủ sức khỏe phục vụ tại ngũ theo kết luận của Hội đồng khám sức khỏe.</li>
                    <li>Là lao động duy nhất phải trực tiếp nuôi dưỡng thân nhân không còn khả năng lao động có UBND cấp xã xác nhận.</li>
                    <li>Một con của bệnh binh, người nhiễm chất độc da cam suy giảm KNLĐ từ 61% đến 80%.</li>
                    <li>Có anh, chị hoặc em ruột là hạ sĩ quan, binh sĩ đang phục vụ tại ngũ hoặc CAND.</li>
                    <li>Đang học phổ thông; đại học/cao đẳng chính quy trong thời gian một khóa đào tạo.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* List 3, 4, 5, 6, 7 Table Displays */}
            {activeListIndex >= 2 && (
              <div className="space-y-4">
                <div className="text-center my-4">
                  <h1 className="text-base font-bold uppercase tracking-tight">
                    {lists[activeListIndex].title}
                  </h1>
                  <p className="text-xs text-slate-500 italic mt-0.5">
                    {lists[activeListIndex].subtitle}
                  </p>
                </div>

                <table className="w-full text-[11px] border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 font-semibold text-center border-b border-slate-300">
                      <th className="p-1.5 border-r border-slate-300 w-8">TT</th>
                      <th className="p-1.5 border-r border-slate-300 text-left">Họ và tên</th>
                      <th className="p-1.5 border-r border-slate-300 w-20">Ngày sinh</th>
                      <th className="p-1.5 border-r border-slate-300 w-24">Số CCCD</th>
                      <th className="p-1.5 border-r border-slate-300 text-left">Nơi cư trú</th>
                      <th className="p-1.5 border-r border-slate-300 w-20">Khu phố</th>
                      <th className="p-1.5 text-left">
                        {activeListIndex === 3 ? 'Lý do Tạm hoãn / Miễn' : activeListIndex === 5 ? 'Phân loại SK' : 'Ghi chú / Bình cử'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(activeListIndex === 2 ? list3Citizens : activeListIndex === 3 ? list4Citizens : activeListIndex === 4 ? list5Citizens : activeListIndex === 5 ? citizens : list7Citizens).map((c, idx) => (
                      <tr key={c.MA_HO_SO}>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                        <td className="p-1.5 border-r border-slate-300 font-semibold">{c.HO_TEN}</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">{c.NGAY_SINH}</td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-mono">
                          {redactSensitiveInfo ? `${c.SO_CCCD.slice(0, 4)}••••${c.SO_CCCD.slice(8)}` : c.SO_CCCD}
                        </td>
                        <td className="p-1.5 border-r border-slate-300">{c.CHO_O_HIEN_NAY}</td>
                        <td className="p-1.5 border-r border-slate-300 text-center">{c.MA_KHU_PHO}</td>
                        <td className="p-1.5">
                          {activeListIndex === 3 ? (
                            redactSensitiveInfo && c.MA_BENH_MIEN_DK_ICD10 ? (
                              <span className="italic text-slate-500">Bệnh lý theo quy định</span>
                            ) : (
                              c.LY_DO_TAM_HOAN_MIEN_CHI_TIET || 'Tạm hoãn'
                            )
                          ) : activeListIndex === 5 ? (
                            c.PHAN_LOAI_KSK_KHU_VUC !== 'CHUA_KL' ? c.PHAN_LOAI_KSK_KHU_VUC : 'Đạt sơ tuyển'
                          ) : (
                            c.CO_DON_TINH_NGUYEN ? 'Có đơn tình nguyện' : 'Đủ điều kiện'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Signature Block */}
            <div className="grid grid-cols-2 text-center text-xs pt-8 border-t border-slate-200 mt-6">
              <div>
                <p className="font-bold uppercase">CHỈ HUY TRƯỞNG BAN CHQS PHƯỜNG</p>
                <p className="italic text-slate-500">(Ký, ghi rõ họ tên)</p>
                <div className="h-16"></div>
                <p className="font-semibold">Trung tá Trần Văn Nam</p>
              </div>
              <div>
                <p className="font-bold uppercase">CHỦ TỊCH HỘI ĐỒNG NVQS PHƯỜNG</p>
                <p className="italic text-slate-500">(Ký tên, đóng dấu)</p>
                <div className="h-16"></div>
                <p className="font-semibold">Chủ tịch UBND Phường</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
