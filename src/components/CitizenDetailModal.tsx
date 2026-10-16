import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  Camera,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HeartPulse,
  Scale,
  Mic,
  MicOff,
  Copy,
  PenTool,
  Upload,
  Eye,
  FileCheck,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  CongDan,
  ThanNhan,
  TaiLieuAnh,
  TaiKhoan,
  CauHinhHeThong,
  DienQuanLyNVQS,
  TrangThaiHoSo,
  LoaiQuanHe,
} from '../types/nvqs.ts';
import {
  roundQuanY,
  calculateBMI,
  validateBmiTT68,
  calculateTotalVision,
  validateVisionTT68,
  DANH_MUC_10_BENH_MIEN_DK,
  evaluateDepressionScore,
  evaluateManiaScore,
  evaluateSchizophreniaScore,
  isThanNhanHopPhapND218,
} from '../utils/nvqsRules.ts';
import { CameraCaptureModal } from './CameraCaptureModal.tsx';
import { SignatureCanvasModal } from './SignatureCanvasModal.tsx';

interface CitizenDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  citizen: CongDan;
  allCitizens: CongDan[];
  allThanNhan: ThanNhan[];
  allDocuments: TaiLieuAnh[];
  currentRole: TaiKhoan;
  cauHinh: CauHinhHeThong;
  onSaveCitizen: (updatedCitizen: CongDan, updatedThanNhan: ThanNhan[], newDocuments: TaiLieuAnh[]) => void;
  onOpenFormsModal: (citizen: CongDan) => void;
  onOpenSanctionsModal: (citizen: CongDan) => void;
}

export const CitizenDetailModal: React.FC<CitizenDetailModalProps> = ({
  isOpen,
  onClose,
  citizen,
  allCitizens,
  allThanNhan,
  allDocuments,
  currentRole,
  cauHinh,
  onSaveCitizen,
  onOpenFormsModal,
  onOpenSanctionsModal,
}) => {
  const [activeTab, setActiveTab] = useState<number>(1); // 1: Hồ sơ & KSK, 2: Thân nhân & Chính trị, 3: Số hóa & Ký số, 4: Kiểm duyệt QA/QC
  const [formData, setFormData] = useState<CongDan>({ ...citizen });
  const [familyMembers, setFamilyMembers] = useState<ThanNhan[]>([]);
  const [documents, setDocuments] = useState<TaiLieuAnh[]>([]);

  // Sub-modals
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);

  // Voice recording state for political attitude
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  // Sync state with selected citizen
  useEffect(() => {
    setFormData({ ...citizen });
    const citizenFamily = allThanNhan.filter((tn) => tn.MA_HO_SO === citizen.MA_HO_SO);
    setFamilyMembers(citizenFamily.length > 0 ? [...citizenFamily] : []);
    const citizenDocs = allDocuments.filter((doc) => doc.MA_HO_SO === citizen.MA_HO_SO);
    setDocuments([...citizenDocs]);
  }, [citizen, allThanNhan, allDocuments]);

  if (!isOpen) return null;

  // Real-time BMI calculation with military rounding
  const handlePhysicalChange = (field: 'height' | 'weight' | 'chest', value: number) => {
    const rawVal = Number(value) || 0;
    const rounded = roundQuanY(rawVal);

    setFormData((prev) => {
      const h = field === 'height' ? rounded : prev.CHIEU_CAO_CM;
      const w = field === 'weight' ? rounded : prev.CAN_NANG_KG;
      const c = field === 'chest' ? rounded : prev.VONG_NGUC_TB_CM;
      const newBmi = calculateBMI(h, w);

      return {
        ...prev,
        CHIEU_CAO_CM: h,
        CAN_NANG_KG: w,
        VONG_NGUC_TB_CM: c,
        CHI_SO_BMI: newBmi,
      };
    });
  };

  // Real-time Vision change & validation
  const handleVisionChange = (field: 'right' | 'left' | 'myopia' | 'hyperopia', value: number) => {
    setFormData((prev) => {
      const r = field === 'right' ? value : prev.THI_LUC_KHONG_KINH_MP;
      const l = field === 'left' ? value : prev.THI_LUC_KHONG_KINH_MT;
      const m = field === 'myopia' ? value : prev.DO_CAN_THI_D || 0;
      const hp = field === 'hyperopia' ? value : prev.DO_VIEN_THI_D || 0;
      const total = calculateTotalVision(r, l);

      return {
        ...prev,
        THI_LUC_KHONG_KINH_MP: r,
        THI_LUC_KHONG_KINH_MT: l,
        DO_CAN_THI_D: m,
        DO_VIEN_THI_D: hp,
        TONG_THI_LUC_2_MAT: total,
      };
    });
  };

  // Validation results
  const bmiCheck = validateBmiTT68(formData.CHIEU_CAO_CM, formData.CAN_NANG_KG);
  const visionCheck = validateVisionTT68({
    rightEyeWithoutGlasses: formData.THI_LUC_KHONG_KINH_MP,
    leftEyeWithoutGlasses: formData.THI_LUC_KHONG_KINH_MT,
    myopiaDiop: formData.DO_CAN_THI_D,
    hyperopiaDiop: formData.DO_VIEN_THI_D,
  });

  // Voice to text simulation / native Web Speech API
  const toggleVoiceInput = (targetId: string, currentText: string, onResult: (text: string) => void) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Trình duyệt của đồng chí chưa hỗ trợ Web Speech API. Vui lòng nhập nội dung tóm tắt bằng bàn phím.');
      return;
    }

    if (isListening && activeVoiceField === targetId) {
      setIsListening(false);
      setActiveVoiceField(null);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      setActiveVoiceField(targetId);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const newText = currentText ? `${currentText} ${transcript}` : transcript;
        onResult(newText);
        setIsListening(false);
        setActiveVoiceField(null);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setActiveVoiceField(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setActiveVoiceField(null);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setActiveVoiceField(null);
    }
  };

  // Sao chép nhanh Cha/Mẹ từ anh em ruột
  const handleInheritFamilyData = () => {
    // Find another citizen with the same address or last name
    const candidates = allCitizens.filter(
      (c) => c.MA_HO_SO !== formData.MA_HO_SO && c.CHO_O_HIEN_NAY === formData.CHO_O_HIEN_NAY
    );
    if (candidates.length === 0) {
      alert('Không tìm thấy hồ sơ anh/em ruột trong cùng hộ gia đình tại địa chỉ này.');
      return;
    }

    const candidate = candidates[0];
    const candidateParents = allThanNhan.filter(
      (tn) => tn.MA_HO_SO === candidate.MA_HO_SO && (tn.LOAI_QUAN_HE === 'CHA_DE' || tn.LOAI_QUAN_HE === 'ME_DE')
    );

    if (candidateParents.length === 0) {
      alert(`Hồ sơ anh/em (${candidate.HO_TEN}) chưa có thông tin Cha, Mẹ.`);
      return;
    }

    const newParents = candidateParents.map((p, idx) => ({
      ...p,
      MA_THAN_NHAN: `TN_${formData.MA_HO_SO}_${idx + 1}`,
      MA_HO_SO: formData.MA_HO_SO,
    }));

    setFamilyMembers((prev) => {
      // remove existing parents if any and replace
      const nonParents = prev.filter((tn) => tn.LOAI_QUAN_HE !== 'CHA_DE' && tn.LOAI_QUAN_HE !== 'ME_DE');
      return [...nonParents, ...newParents];
    });

    alert(`Đã kế thừa thành công thông tin Cha, Mẹ và lịch sử Thái độ chính trị từ hồ sơ của ${candidate.HO_TEN}!`);
  };

  // Add a new family member
  const handleAddFamilyMember = (loai: LoaiQuanHe) => {
    const isHopPhap = isThanNhanHopPhapND218(loai);
    const newMember: ThanNhan = {
      MA_THAN_NHAN: `TN_${formData.MA_HO_SO}_${Date.now().toString().slice(-4)}`,
      MA_HO_SO: formData.MA_HO_SO,
      LOAI_QUAN_HE: loai,
      THUOC_NHOM_THAN_NHAN_ND218: isHopPhap,
      HO_TEN_THAN_NHAN: '',
      NAM_SINH: 1980,
      TINH_TRANG_SINH_TU: 'CON_SONG',
      TINH_TRANG_TATS: 'KHONG_CO',
    };
    setFamilyMembers((prev) => [...prev, newMember]);
  };

  // Update family member
  const handleUpdateFamilyMember = (index: number, updates: Partial<ThanNhan>) => {
    setFamilyMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };

      // Cross-check: If citizen themselves has criminal record -> auto set to KHONG_DUOC_DANG_KY
      if (copy[index].LOAI_QUAN_HE === 'BAN_THAN_CONG_DAN') {
        if (
          copy[index].TINH_TRANG_TATS === 'CO_TIEN_AN_TIEN_SU' ||
          copy[index].TINH_TRANG_TATS === 'DANG_KHOI_TO_DIEU_TRA'
        ) {
          if (copy[index].TINH_TRANG_XOA_AN_TICH !== 'DA_XOA_AN_TICH') {
            setFormData((f) => ({
              ...f,
              DIEN_QUAN_LY_NVQS: 'NHOM_1_KHONG_DUOC_DANG_KY',
              LY_DO_TAM_HOAN_MIEN_CHI_TIET: 'Đang bị truy cứu TNHS hoặc chưa được xóa án tích (Khoản 1 Điều 13 Luật NVQS)',
            }));
          }
        }
      }

      return copy;
    });
  };

  // Remove family member
  const handleRemoveFamilyMember = (index: number) => {
    setFamilyMembers((prev) => prev.filter((_, i) => i !== index));
  };

  // Document scan upload simulation
  const handleAddDocument = (loai: string) => {
    const docCount = documents.filter((d) => d.LOAI_TAI_LIEU === loai).length + 1;
    const docSeq = String(docCount).padStart(3, '0');
    const pageSeq = '001';
    const maTaiLieu = `${formData.MA_HO_SO}_${loai}_${docSeq}`;
    const maAnh = `${maTaiLieu}_${pageSeq}`;

    const newDoc: TaiLieuAnh = {
      MA_ANH: maAnh,
      MA_TAI_LIEU: maTaiLieu,
      MA_HO_SO: formData.MA_HO_SO,
      LOAI_TAI_LIEU: loai as any,
      TEN_LOAI_TAI_LIEU: loai,
      SO_THU_TU_TRANG: 1,
      TEN_TEP_DRIVE: `${maAnh}.jpg`,
      DRIVE_FILE_ID: `DRIVE_FILE_${Date.now()}`,
      LINK_XEM_ANH: 'https://images.unsplash.com/photo-1584697964190-71c4c1a79a95?w=400&q=80',
      NOI_DUNG_OCR: `Văn bản chứng minh ${loai} của công dân ${formData.HO_TEN}, số CCCD ${formData.SO_CCCD}. Đã quét định dạng ảnh độ nét cao.`,
      TRANG_THAI_KIEM_DUYET_OCR: 'OCR_DA_DUYET',
      TRANG_THAI_TEP: 'DANG_SU_DUNG',
      NGUOI_TAI_LEN: currentRole.TEN_DANG_NHAP,
      THOI_GIAN_TAI_LEN: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setDocuments((prev) => [...prev, newDoc]);
  };

  const handleSaveAll = () => {
    const updated: CongDan = {
      ...formData,
      HO_TEN: formData.HO_TEN.trim().toUpperCase(),
      NGUOI_CAP_NHAT: currentRole.TEN_DANG_NHAP,
      THOI_GIAN_CAP_NHAT: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    onSaveCitizen(updated, familyMembers, documents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {/* Portrait thumbnail 4x6 */}
            <div
              onClick={() => setIsCameraOpen(true)}
              className="w-11 h-15 rounded border border-yellow-400/80 overflow-hidden bg-slate-800 flex items-center justify-center cursor-pointer hover:opacity-90 relative group shadow-sm shrink-0"
              title="Bấm để chụp ảnh chân dung 4×6 cm"
            >
              {formData.ID_ANH_THE_4X6 ? (
                <img src={formData.ID_ANH_THE_4X6} alt="Ảnh thẻ" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-5 h-5 text-yellow-300" />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[9px] text-yellow-300 font-bold transition-opacity">
                4×6
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-yellow-400 tracking-tight">
                  {formData.HO_TEN}
                </h2>
                <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {formData.MA_HO_SO}
                </span>
                <span className="text-xs bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                  {formData.MA_KHU_PHO}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                CCCD: <strong className="font-mono text-white">{formData.SO_CCCD}</strong> · Sinh ngày:{' '}
                <strong className="font-mono text-white">{formData.NGAY_SINH}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFormsModal(formData)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>In Phiếu TT 106</span>
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng cửa sổ hồ sơ"
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 4 Feature Block Tabs */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab(1)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 1
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Thẻ 1: Lý lịch & Sơ tuyển SK</span>
          </button>

          <button
            onClick={() => setActiveTab(2)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 2
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Thẻ 2: Thân nhân & Chính trị</span>
          </button>

          <button
            onClick={() => setActiveTab(3)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 3
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Thẻ 3: Số hóa Scan & Ký số GPS</span>
          </button>

          <button
            onClick={() => setActiveTab(4)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 4
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Thẻ 4: Kiểm duyệt & Giao quân</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: HỒ SƠ CÔNG DÂN, CƯ TRÚ & SƠ TUYỂN SỨC KHỎE */}
          {activeTab === 1 && (
            <div className="space-y-6">
              {/* 1.1 Thông tin định danh */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                  1.1. Thông tin Định danh & Học vấn cá nhân
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Họ và tên khai sinh (Tự in hoa):</label>
                    <input
                      type="text"
                      value={formData.HO_TEN}
                      onChange={(e) => setFormData({ ...formData, HO_TEN: e.target.value.toUpperCase() })}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-slate-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Số CCCD / Định danh (12 số):</label>
                    <input
                      type="text"
                      maxLength={12}
                      value={formData.SO_CCCD}
                      onChange={(e) => setFormData({ ...formData, SO_CCCD: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Ngày tháng năm sinh:</label>
                    <input
                      type="date"
                      value={formData.NGAY_SINH}
                      onChange={(e) => setFormData({ ...formData, NGAY_SINH: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Dân tộc:</label>
                    <input
                      type="text"
                      value={formData.DAN_TOC}
                      onChange={(e) => setFormData({ ...formData, DAN_TOC: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Tôn giáo:</label>
                    <input
                      type="text"
                      value={formData.TON_GIAO}
                      onChange={(e) => setFormData({ ...formData, TON_GIAO: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Mã Khu phố quản lý:</label>
                    <select
                      value={formData.MA_KHU_PHO}
                      onChange={(e) => setFormData({ ...formData, MA_KHU_PHO: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                    >
                      {cauHinh.DANH_SACH_KHU_PHO.map((kp) => (
                        <option key={kp.ma} value={kp.ma}>{kp.ten}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Học vấn & Chuyên môn kỹ thuật */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Trình độ văn hóa phổ thông:</label>
                    <input
                      type="text"
                      placeholder="Lớp mấy/12 (ví dụ: 12/12)"
                      value={formData.TRINH_DO_VAN_HOA}
                      onChange={(e) => setFormData({ ...formData, TRINH_DO_VAN_HOA: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Trình độ CMKT:</label>
                    <select
                      value={formData.TRINH_DO_CMKT}
                      onChange={(e) => setFormData({ ...formData, TRINH_DO_CMKT: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="KHONG">Không có chuyên môn</option>
                      <option value="SO_CAP">Sơ cấp nghề</option>
                      <option value="TRUNG_CAP">Trung cấp</option>
                      <option value="CAO_DANG">Cao đẳng</option>
                      <option value="DAI_HOC">Đại học</option>
                      <option value="SAU_DAI_HOC">Sau đại học</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Tình trạng đào tạo:</label>
                    <select
                      value={formData.TINH_TRANG_DAO_TAO}
                      onChange={(e) => setFormData({ ...formData, TINH_TRANG_DAO_TAO: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="DANG_HOC">Đang theo học</option>
                      <option value="DA_TOT_NGHIEP">Đã tốt nghiệp</option>
                      <option value="KHONG_AP_DUNG">Không áp dụng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Khóa đào tạo thứ mấy:</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={formData.KHOA_DAO_TAO_THU || 1}
                      onChange={(e) => setFormData({ ...formData, KHOA_DAO_TAO_THU: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 font-mono"
                      title="Điểm g Khoản 1 Điều 41 Luật NVQS: Chỉ tạm hoãn trong thời gian 1 khóa đào tạo"
                    />
                  </div>
                </div>

                {formData.TRINH_DO_CMKT !== 'KHONG' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Cơ sở giáo dục / Trường:</label>
                      <input
                        type="text"
                        value={formData.TEN_TRUONG || ''}
                        onChange={(e) => setFormData({ ...formData, TEN_TRUONG: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Ngành / Chuyên ngành:</label>
                      <input
                        type="text"
                        value={formData.NGANH_HOC || ''}
                        onChange={(e) => setFormData({ ...formData, NGANH_HOC: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Hệ đào tạo:</label>
                      <select
                        value={formData.HE_DAO_TAO}
                        onChange={(e) => setFormData({ ...formData, HE_DAO_TAO: e.target.value as any })}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                      >
                        <option value="CHINH_QUY">Chính quy (Thuộc diện tạm hoãn Đ.41)</option>
                        <option value="KHONG_CHINH_QUY">Không chính quy (Vừa làm vừa học/Từ xa)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 1.2 Cư trú & Quản lý di biến động */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    1.2. Cư trú, Di biến động & Thời hạn Đăng ký (Điều 17 Luật NVQS & NĐ 218)
                  </h3>
                  {formData.TRANG_THAI_DK_BIEN_DONG === 'QUA_HAN_5_NGAY' && (
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Quá hạn 05 ngày đăng ký
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Nơi đăng ký thường trú (Hộ khẩu):</label>
                    <input
                      type="text"
                      value={formData.NOI_DKTT}
                      onChange={(e) => setFormData({ ...formData, NOI_DKTT: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Chỗ ở hiện nay của bản thân & gia đình:</label>
                    <input
                      type="text"
                      value={formData.CHO_O_HIEN_NAY}
                      onChange={(e) => setFormData({ ...formData, CHO_O_HIEN_NAY: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Số điện thoại công dân:</label>
                    <input
                      type="tel"
                      value={formData.SDT_CONG_DAN}
                      onChange={(e) => setFormData({ ...formData, SDT_CONG_DAN: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Số điện thoại thân nhân liên hệ:</label>
                    <input
                      type="tel"
                      value={formData.SDT_GIA_DINH}
                      onChange={(e) => setFormData({ ...formData, SDT_GIA_DINH: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                    />
                  </div>
                </div>

                {/* Tình trạng cư trú */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Trạng thái hiện diện thực tế:</label>
                    <select
                      value={formData.TINH_TRANG_CU_TRU}
                      onChange={(e) => setFormData({ ...formData, TINH_TRANG_CU_TRU: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                    >
                      <option value="CO_MAT_TAI_DIA_PHUONG">Có mặt tại địa phương</option>
                      <option value="DI_HOC_TAP_LAM_AN_XA_CO_DANG_KY">Đi học tập / làm ăn xa (Có đăng ký NVQS tạm vắng)</option>
                      <option value="TAM_VANG_TREN_3_THANG_CHUA_DANG_KY">Tạm vắng &ge; 03 tháng (Chưa đăng ký - Vi phạm NĐ 218)</option>
                      <option value="VANG_MAT_KHONG_RO_NOI_DEN">Vắng mặt không rõ nơi đến</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Kiểm soát thời hạn đăng ký biến động:</label>
                    <select
                      value={formData.TRANG_THAI_DK_BIEN_DONG}
                      onChange={(e) => setFormData({ ...formData, TRANG_THAI_DK_BIEN_DONG: e.target.value as any })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="DUNG_HAN">Đúng hạn quy định</option>
                      <option value="QUA_HAN_5_NGAY">Quá hạn 05 ngày làm việc (Cảnh báo VPHC Đ.8 NĐ 218)</option>
                    </select>
                  </div>
                </div>

                {formData.TINH_TRANG_CU_TRU !== 'CO_MAT_TAI_DIA_PHUONG' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <div>
                      <label className="block text-amber-900 mb-1 font-medium">Địa chỉ nơi làm việc/học tập/tạm trú thực tế:</label>
                      <input
                        type="text"
                        value={formData.NOI_LAM_VIEC_TAM_TRU_XA || ''}
                        onChange={(e) => setFormData({ ...formData, NOI_LAM_VIEC_TAM_TRU_XA: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-amber-900 mb-1 font-medium">Tên cơ quan / trường học / chủ SDLĐ:</label>
                      <input
                        type="text"
                        value={formData.TEN_CO_QUAN_TRUONG_CHU_SDLD || ''}
                        onChange={(e) => setFormData({ ...formData, TEN_CO_QUAN_TRUONG_CHU_SDLD: e.target.value })}
                        className="w-full p-2 bg-white border border-amber-300 rounded text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 1.4 Bộ lọc Sơ tuyển sức khỏe Quân y (TT 105 & TT 68 & TT 106) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-red-600" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      1.4. Bộ lọc Sơ tuyển Sức khỏe & Chốt chặn Tự động (TT 105/2023 & TT 68/2025)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">Mẫu 2 Phụ lục I TT 106/2025</span>
                </div>

                {/* Thể lực: Làm tròn Quân y & BMI */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-800">
                      Chỉ số Thể lực (Tự động làm tròn Quân y: &ge;0.50 làm tròn lên, &le;0.49 bỏ phần lẻ):
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      bmiCheck.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      BMI: {formData.CHI_SO_BMI} · {bmiCheck.classification}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Chiều cao đứng (cm):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.CHIEU_CAO_CM}
                        onChange={(e) => handlePhysicalChange('height', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Cân nặng (kg):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.CAN_NANG_KG}
                        onChange={(e) => handlePhysicalChange('weight', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Vòng ngực TB (cm):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.VONG_NGUC_TB_CM}
                        onChange={(e) => handlePhysicalChange('chest', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Huyết áp (mmHg):</label>
                      <input
                        type="text"
                        placeholder="120/80"
                        value={formData.HUYET_AP_MMHG || ''}
                        onChange={(e) => setFormData({ ...formData, HUYET_AP_MMHG: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  {bmiCheck.warningMessage && (
                    <div className="mt-2.5 p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{bmiCheck.warningMessage}</span>
                    </div>
                  )}
                </div>

                {/* Thị lực & Tật khúc xạ */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-800">
                      Thị lực & Tật khúc xạ (Mỗi mắt tối đa 10/10, mắt trái không bù mắt phải):
                    </span>
                    <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                      visionCheck.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      Tổng thị lực: {formData.TONG_THI_LUC_2_MAT}/20
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1">Thị lực Mắt phải (/10):</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.THI_LUC_KHONG_KINH_MP}
                        onChange={(e) => handleVisionChange('right', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Thị lực Mắt trái (/10):</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={formData.THI_LUC_KHONG_KINH_MT}
                        onChange={(e) => handleVisionChange('left', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Độ cận thị (Diop):</label>
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        value={formData.DO_CAN_THI_D || 0}
                        onChange={(e) => handleVisionChange('myopia', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">Độ viễn thị (Diop):</label>
                      <input
                        type="number"
                        step="0.25"
                        min={0}
                        value={formData.DO_VIEN_THI_D || 0}
                        onChange={(e) => handleVisionChange('hyperopia', Number(e.target.value))}
                        className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                      />
                    </div>
                  </div>

                  {visionCheck.warningMessage && (
                    <div className="mt-2.5 p-3 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{visionCheck.warningMessage}</span>
                    </div>
                  )}
                </div>

                {/* Sàng lọc 10 bệnh miễn đăng ký NVQS (Mục III PL I TT 105) */}
                <div className="pt-3 border-t border-slate-200">
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Sàng lọc 10 bệnh thuộc Danh mục Miễn đăng ký NVQS (Mục III Phụ lục I TT 105/2023):
                  </label>
                  <select
                    value={formData.MA_BENH_MIEN_DK_ICD10 || 'KHONG'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== 'KHONG') {
                        setFormData({
                          ...formData,
                          MA_BENH_MIEN_DK_ICD10: val,
                          DIEN_QUAN_LY_NVQS: 'NHOM_2_MIEN_DANG_KY',
                          KET_LUAN_SO_TUYEN_XA: 'KHONG_DAT_SO_TUYEN',
                          LY_DO_SO_TUYEN: `Mắc bệnh ${val} thuộc Danh mục 10 bệnh miễn đăng ký NVQS`,
                          LY_DO_TAM_HOAN_MIEN_CHI_TIET: `Mắc bệnh mã ICD-10: ${val} theo Thông tư 105/2023/TT-BQP`,
                        });
                      } else {
                        setFormData({
                          ...formData,
                          MA_BENH_MIEN_DK_ICD10: undefined,
                        });
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded text-xs text-slate-900 cursor-pointer"
                  >
                    <option value="KHONG">Không mắc bệnh trong danh mục miễn đăng ký</option>
                    {DANH_MUC_10_BENH_MIEN_DK.map((b) => (
                      <option key={b.stt} value={b.maICD10}>
                        {b.stt}. {b.tenBenh} (Mã ICD10: {b.maICD10})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phiếu chẩn đoán nhanh tâm thần */}
                <div className="pt-3 border-t border-slate-200 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-slate-800">
                      Phiếu chẩn đoán nhanh bệnh tâm thần thường gặp (Phụ lục III TT 105/2023):
                    </span>
                    <span className="text-[11px] text-slate-500">Tự động cộng điểm</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="font-medium text-slate-800 mb-1">Trầm cảm (9 câu - 2 tuần)</div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Điểm:</span>
                        <input
                          type="number"
                          min={0}
                          max={9}
                          value={formData.DIEM_TRAM_CAM}
                          onChange={(e) => setFormData({ ...formData, DIEM_TRAM_CAM: Number(e.target.value) })}
                          className="w-16 p-1 bg-white border border-slate-300 rounded text-center font-mono font-bold"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Kết quả: <strong>{evaluateDepressionScore(formData.DIEM_TRAM_CAM)}</strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="font-medium text-slate-800 mb-1">Hưng cảm (8 câu - 1 tuần)</div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Điểm:</span>
                        <input
                          type="number"
                          min={0}
                          max={8}
                          value={formData.DIEM_HUNG_CAM}
                          onChange={(e) => setFormData({ ...formData, DIEM_HUNG_CAM: Number(e.target.value) })}
                          className="w-16 p-1 bg-white border border-slate-300 rounded text-center font-mono font-bold"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Kết quả: <strong>{evaluateManiaScore(formData.DIEM_HUNG_CAM)}</strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <div className="font-medium text-slate-800 mb-1">Tâm thần phân liệt (2 câu)</div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Điểm:</span>
                        <input
                          type="number"
                          min={0}
                          max={2}
                          value={formData.DIEM_TAM_THAN_PHAN_LIET}
                          onChange={(e) => setFormData({ ...formData, DIEM_TAM_THAN_PHAN_LIET: Number(e.target.value) })}
                          className="w-16 p-1 bg-white border border-slate-300 rounded text-center font-mono font-bold"
                        />
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        Kết quả: <strong>{evaluateSchizophreniaScore(formData.DIEM_TAM_THAN_PHAN_LIET)}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tiền sử bệnh, Dị tật hình xăm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Tiền sử bệnh bản thân & gia đình:</label>
                    <textarea
                      rows={2}
                      value={formData.TIEN_SU_BENH_BAN_THAN || ''}
                      onChange={(e) => setFormData({ ...formData, TIEN_SU_BENH_BAN_THAN: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Đặc điểm hình xăm, chữ xăm (vị trí, diện tích):</label>
                    <textarea
                      rows={2}
                      value={formData.DAC_DIEM_HINH_XAM || ''}
                      onChange={(e) => setFormData({ ...formData, DAC_DIEM_HINH_XAM: e.target.value })}
                      placeholder="Ghi rõ vị trí (cổ, tay, lưng), diện tích và nội dung hình xăm..."
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 1.5 Phân loại 6 diện quản lý NVQS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                  1.5. Phân loại Diện quản lý NVQS (Chuẩn Luật NVQS 2026 & TT 68/2025)
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Chọn Nhóm phân loại chính xác:</label>
                    <select
                      value={formData.DIEN_QUAN_LY_NVQS}
                      onChange={(e) => setFormData({ ...formData, DIEN_QUAN_LY_NVQS: e.target.value as any })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded font-bold text-slate-900 cursor-pointer"
                    >
                      <option value="NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU">Nhóm 6 – Đủ điều kiện sơ tuyển, khám tuyển và gọi nhập ngũ</option>
                      <option value="NHOM_5_TAM_HOAN_GOI_NHAP_NGU">Nhóm 5 – Tạm hoãn gọi nhập ngũ (Khoản 1 Điều 41)</option>
                      <option value="NHOM_1_KHONG_DUOC_DANG_KY">Nhóm 1 – Không được đăng ký NVQS (Điều 13: án tích, cải tạo, cai nghiện)</option>
                      <option value="NHOM_2_MIEN_DANG_KY">Nhóm 2 – Miễn đăng ký NVQS (Điều 14: 10 bệnh hiểm nghèo TT 105)</option>
                      <option value="NHOM_3_HOAN_THANH_TAI_NGU">Nhóm 3 – Công nhận hoàn thành NVQS tại ngũ (Điều 4: DQTT 24T, CAX 36T...)</option>
                      <option value="NHOM_4_MIEN_GOI_NHAP_NGU">Nhóm 4 – Miễn gọi nhập ngũ (Khoản 2 Điều 41: con liệt sĩ, thương binh)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Chi tiết căn cứ Tạm hoãn / Miễn:</label>
                      <input
                        type="text"
                        value={formData.LY_DO_TAM_HOAN_MIEN_CHI_TIET || ''}
                        onChange={(e) => setFormData({ ...formData, LY_DO_TAM_HOAN_MIEN_CHI_TIET: e.target.value })}
                        placeholder="Ví dụ: Đang học đại học chính quy / Lao động duy nhất có xác nhận..."
                        className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1 font-medium">Phân luồng tuyển chọn:</label>
                      <select
                        value={formData.PHAN_LUONG_TUYEN_CHON}
                        onChange={(e) => setFormData({ ...formData, PHAN_LUONG_TUYEN_CHON: e.target.value as any })}
                        className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold"
                      >
                        <option value="NGHIA_VU_QUAN_SU">Nghĩa vụ Quân sự (Bộ Quốc phòng)</option>
                        <option value="NGHIA_VU_CONG_AN_NHAN_DAN">Nghĩa vụ Công an nhân dân (Bộ Công an)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="volunteer"
                      checked={formData.CO_DON_TINH_NGUYEN}
                      onChange={(e) => setFormData({ ...formData, CO_DON_TINH_NGUYEN: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="volunteer" className="text-xs font-bold text-emerald-800 cursor-pointer">
                      Công dân có Đơn tình nguyện nhập ngũ (Khoản 3 Điều 41: Ưu tiên tuyển chọn dù thuộc diện tạm hoãn)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THÂN NHÂN, THÁI ĐỘ CHÍNH TRỊ & TIỀN ÁN TIỀN SỰ */}
          {activeTab === 2 && (
            <div className="space-y-6">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                    Quản lý Thân nhân & Lịch sử Thái độ Chính trị (Bảng THAN_NHAN)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Phục vụ thẩm tra tiêu chuẩn chính trị, đạo đức và xác minh lý do chính đáng (NĐ 218/2025).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleInheritFamilyData}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                    title="Kế thừa Cha, Mẹ từ anh/em ruột trong cùng hộ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép nhanh Cha, Mẹ</span>
                  </button>

                  <button
                    onClick={() => handleAddFamilyMember('CHA_DE')}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Cha/Mẹ/Vợ</span>
                  </button>
                </div>
              </div>

              {/* Family Members List */}
              {familyMembers.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed rounded-xl">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Chưa có thông tin thân nhân nào cho hồ sơ này</p>
                  <button
                    onClick={() => handleAddFamilyMember('CHA_DE')}
                    className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    + Thêm thông tin Cha đẻ / Mẹ đẻ
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {familyMembers.map((member, index) => {
                    const isCitizenHimself = member.LOAI_QUAN_HE === 'BAN_THAN_CONG_DAN';
                    const isDeceased = member.TINH_TRANG_SINH_TU === 'DA_CHET';
                    const hasTATS = member.TINH_TRANG_TATS !== 'KHONG_CO';

                    return (
                      <div
                        key={member.MA_THAN_NHAN}
                        className="p-4 bg-white border border-slate-300 rounded-xl shadow-xs space-y-3"
                      >
                        {/* Member Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-700">
                              {member.MA_THAN_NHAN}
                            </span>
                            <span className="font-bold text-xs text-slate-900">
                              {member.LOAI_QUAN_HE === 'CHA_DE'
                                ? 'Cha đẻ'
                                : member.LOAI_QUAN_HE === 'ME_DE'
                                ? 'Mẹ đẻ'
                                : member.LOAI_QUAN_HE === 'VO'
                                ? 'Vợ'
                                : member.LOAI_QUAN_HE === 'BAN_THAN_CONG_DAN'
                                ? 'Bản thân công dân'
                                : member.LOAI_QUAN_HE}
                            </span>
                            {member.THUOC_NHOM_THAN_NHAN_ND218 && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                                Thân nhân hợp pháp (NĐ 218)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <select
                              value={member.TINH_TRANG_SINH_TU}
                              onChange={(e) =>
                                handleUpdateFamilyMember(index, {
                                  TINH_TRANG_SINH_TU: e.target.value as any,
                                  NOI_CU_TRU: e.target.value === 'DA_CHET' ? 'KHONG_AP_DUNG' : member.NOI_CU_TRU,
                                  NGHE_NGHIEP: e.target.value === 'DA_CHET' ? 'KHONG_AP_DUNG' : member.NGHE_NGHIEP,
                                })
                              }
                              className={`text-xs px-2 py-1 rounded font-semibold border ${
                                isDeceased ? 'bg-slate-200 text-slate-800' : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              }`}
                            >
                              <option value="CON_SONG">Còn sống</option>
                              <option value="DA_CHET">Đã chết</option>
                            </select>

                            <button
                              onClick={() => handleRemoveFamilyMember(index)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Xóa dòng thân nhân này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div className="sm:col-span-2">
                            <label className="block text-slate-600 mb-1 font-medium">Họ và tên thân nhân:</label>
                            <input
                              type="text"
                              value={member.HO_TEN_THAN_NHAN}
                              onChange={(e) => handleUpdateFamilyMember(index, { HO_TEN_THAN_NHAN: e.target.value })}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-900"
                            />
                          </div>

                          <div>
                            <label className="block text-slate-600 mb-1 font-medium">Năm sinh:</label>
                            <input
                              type="number"
                              value={member.NAM_SINH}
                              onChange={(e) => handleUpdateFamilyMember(index, { NAM_SINH: Number(e.target.value) })}
                              className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-slate-900"
                            />
                          </div>

                          {isDeceased ? (
                            <div>
                              <label className="block text-slate-600 mb-1 font-medium">Năm chết:</label>
                              <input
                                type="number"
                                value={member.NAM_CHET || 2020}
                                onChange={(e) => handleUpdateFamilyMember(index, { NAM_CHET: Number(e.target.value) })}
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-mono text-slate-900"
                              />
                            </div>
                          ) : (
                            <div>
                              <label className="block text-slate-600 mb-1 font-medium">Nghề nghiệp hiện tại:</label>
                              <input
                                type="text"
                                value={member.NGHE_NGHIEP || ''}
                                onChange={(e) => handleUpdateFamilyMember(index, { NGHE_NGHIEP: e.target.value })}
                                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-slate-900"
                              />
                            </div>
                          )}
                        </div>

                        {/* Thái độ chính trị 4 giai đoạn */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">
                              Trường "Thái độ chính trị" (Lọc theo năm sinh/chết - Tích hợp Voice-to-Text):
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Bấm Micro để đọc lời khai
                            </span>
                          </div>

                          {/* Phase 1: Trước 1945 (chỉ hiện nếu sinh trước 1945) */}
                          {member.NAM_SINH <= 1945 && (
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[11px] text-slate-600 font-medium">1. Trước Cách mạng Tháng 8 năm 1945:</label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleVoiceInput(
                                      `tdct_truoc_1945_${index}`,
                                      member.TDCT_TRUOC_1945 || '',
                                      (t) => handleUpdateFamilyMember(index, { TDCT_TRUOC_1945: t })
                                    )
                                  }
                                  className="p-1 text-slate-500 hover:text-emerald-700"
                                >
                                  {isListening && activeVoiceField === `tdct_truoc_1945_${index}` ? (
                                    <MicOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                                  ) : (
                                    <Mic className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                              <input
                                type="text"
                                value={member.TDCT_TRUOC_1945 || ''}
                                onChange={(e) => handleUpdateFamilyMember(index, { TDCT_TRUOC_1945: e.target.value })}
                                className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                              />
                            </div>
                          )}

                          {/* Phase 2: 1945 - 1954 */}
                          {member.NAM_SINH <= 1954 && (
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[11px] text-slate-600 font-medium">2. Giai đoạn 1945 – 1954:</label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleVoiceInput(
                                      `tdct_1945_1954_${index}`,
                                      member.TDCT_1945_1954 || '',
                                      (t) => handleUpdateFamilyMember(index, { TDCT_1945_1954: t })
                                    )
                                  }
                                  className="p-1 text-slate-500 hover:text-emerald-700"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={member.TDCT_1945_1954 || ''}
                                onChange={(e) => handleUpdateFamilyMember(index, { TDCT_1945_1954: e.target.value })}
                                className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                              />
                            </div>
                          )}

                          {/* Phase 3: 1954 - 1975 */}
                          {member.NAM_SINH <= 1975 && (
                            <div>
                              <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[11px] text-slate-600 font-medium">3. Giai đoạn 1954 – 1975:</label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleVoiceInput(
                                      `tdct_1954_1975_${index}`,
                                      member.TDCT_1954_1975 || '',
                                      (t) => handleUpdateFamilyMember(index, { TDCT_1954_1975: t })
                                    )
                                  }
                                  className="p-1 text-slate-500 hover:text-emerald-700"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={member.TDCT_1954_1975 || ''}
                                onChange={(e) => handleUpdateFamilyMember(index, { TDCT_1954_1975: e.target.value })}
                                className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                              />
                            </div>
                          )}

                          {/* Phase 4: Từ 1975 đến nay */}
                          <div>
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[11px] text-slate-600 font-medium">4. Giai đoạn từ năm 1975 đến nay:</label>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleVoiceInput(
                                    `tdct_tu_1975_${index}`,
                                    member.TDCT_TU_1975_NAY || '',
                                    (t) => handleUpdateFamilyMember(index, { TDCT_TU_1975_NAY: t })
                                  )
                                }
                                className="p-1 text-slate-500 hover:text-emerald-700"
                              >
                                <Mic className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={member.TDCT_TU_1975_NAY || ''}
                              onChange={(e) => handleUpdateFamilyMember(index, { TDCT_TU_1975_NAY: e.target.value })}
                              placeholder="Ghi tóm tắt nghề nghiệp, việc chấp hành chủ trương pháp luật..."
                              className="w-full p-1.5 bg-white border border-slate-300 rounded text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Tiền án, tiền sự chi tiết */}
                        <div className="p-3 bg-slate-100 rounded-lg border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">Tình trạng Tiền án, tiền sự:</span>
                            <select
                              value={member.TINH_TRANG_TATS}
                              onChange={(e) => handleUpdateFamilyMember(index, { TINH_TRANG_TATS: e.target.value as any })}
                              className={`p-1 rounded font-bold border ${
                                hasTATS ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-white text-slate-700'
                              }`}
                            >
                              <option value="KHONG_CO">Không có tiền án, tiền sự</option>
                              <option value="CO_TIEN_AN_TIEN_SU">Có tiền án / tiền sự</option>
                              <option value="DANG_KHOI_TO_DIEU_TRA">Đang khởi tố / điều tra</option>
                              <option value="CHUA_RO_CAN_XAC_MINH">Chưa rõ (Cần xác minh Công an)</option>
                            </select>
                          </div>

                          {hasTATS && (
                            <div className="space-y-2 pt-2 border-t border-slate-200">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <div>
                                  <label className="block text-slate-600 mb-0.5">Phân loại vi phạm:</label>
                                  <select
                                    value={member.PHAN_LOAI_VP || 'TIEN_AN'}
                                    onChange={(e) => handleUpdateFamilyMember(index, { PHAN_LOAI_VP: e.target.value as any })}
                                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                                  >
                                    <option value="TIEN_AN">Tiền án (Bản án hình sự Tòa án)</option>
                                    <option value="TIEN_SU_BIEN_PHAP_HC">Tiền sự / Giáo dục xã / Cai nghiện</option>
                                    <option value="DANG_TRUY_CUU_TNHS">Đang bị truy cứu TNHS</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-slate-600 mb-0.5">Tội danh / Hành vi vi phạm:</label>
                                  <input
                                    type="text"
                                    value={member.TOI_DANH_HANH_VI || ''}
                                    onChange={(e) => handleUpdateFamilyMember(index, { TOI_DANH_HANH_VI: e.target.value })}
                                    className="w-full p-1.5 bg-white border border-slate-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-slate-600 mb-0.5">Tình trạng xóa án tích:</label>
                                  <select
                                    value={member.TINH_TRANG_XOA_AN_TICH || 'DANG_CHAP_HANH'}
                                    onChange={(e) => handleUpdateFamilyMember(index, { TINH_TRANG_XOA_AN_TICH: e.target.value as any })}
                                    className="w-full p-1.5 bg-white border border-slate-300 rounded font-semibold text-rose-800"
                                  >
                                    <option value="DANG_CHAP_HANH">Đang chấp hành</option>
                                    <option value="CHUA_XOA_AN_TICH">Đã chấp hành xong nhưng CHƯA xóa án tích</option>
                                    <option value="DA_XOA_AN_TICH">Đã được xóa án tích / Hết thời hạn</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SỐ HÓA MINH CHỨNG SCAN & KÝ SỐ GPS */}
          {activeTab === 3 && (
            <div className="space-y-6">
              {/* Digitization Header */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                      Số hóa Giấy tờ Minh chứng (Scan 3 Cấp) & Ký số Điện tử
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Mã Cấp 1 (Hồ sơ) &rarr; Mã Cấp 2 (Tài liệu) &rarr; Mã Cấp 3 (Trang ảnh). Tích hợp OCR tra cứu nhanh.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSignatureOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>{formData.ID_ANH_CHU_KY ? 'Ký lại Chữ ký tay' : 'Ký xác nhận (Canvas)'}</span>
                    </button>
                  </div>
                </div>

                {/* Add new scanned document trigger */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 text-xs">
                  <span className="font-medium text-slate-600">Thêm trang scan:</span>
                  <button
                    onClick={() => handleAddDocument('CCCD')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    + CCCD
                  </button>
                  <button
                    onClick={() => handleAddDocument('GKS')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    + Khai sinh
                  </button>
                  <button
                    onClick={() => handleAddDocument('BANG_THPT')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    + Bằng THPT
                  </button>
                  <button
                    onClick={() => handleAddDocument('XAC_NHAN_SV')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    + XN Sinh viên
                  </button>
                  <button
                    onClick={() => handleAddDocument('DON_TINH_NGUYEN')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    + Đơn tình nguyện
                  </button>
                  <button
                    onClick={() => handleAddDocument('HO_SO_Y_TE')}
                    className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100"
                  >
                    + Bệnh án miễn ĐK
                  </button>
                </div>
              </div>

              {/* Digital Signature Display */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Chữ ký điện tử & Dấu vết GPS tại Hộ gia đình:</span>
                  {formData.TOA_DO_GPS && (
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                      GPS: {formData.TOA_DO_GPS.lat}, {formData.TOA_DO_GPS.lng} (±{formData.TOA_DO_GPS.accuracy}m)
                    </span>
                  )}
                </div>

                {formData.ID_ANH_CHU_KY ? (
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <img
                      src={formData.ID_ANH_CHU_KY}
                      alt="Chữ ký điện tử"
                      className="h-16 bg-white p-1 rounded border border-slate-300 object-contain"
                    />
                    <div className="text-xs text-slate-600 space-y-1">
                      <p>Người ký: <strong className="text-slate-900">{formData.HO_TEN}</strong></p>
                      <p>Thời điểm ký: <span className="font-mono">{formData.THOI_GIAN_CAP_NHAT}</span></p>
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã xác thực cán bộ xuống tận hộ gia đình thu thập.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-center justify-between">
                    <span>Hồ sơ chưa có chữ ký số xác nhận của công dân/thân nhân.</span>
                    <button
                      onClick={() => setIsSignatureOpen(true)}
                      className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                    >
                      Bấm để ký ngay
                    </button>
                  </div>
                )}
              </div>

              {/* Scanned Documents Grid */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Tài liệu đính kèm ({documents.length} trang đã gắn mã 3 cấp):
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.MA_ANH}
                      className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {doc.MA_ANH}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                          {doc.TRANG_THAI_KIEM_DUYET_OCR}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <img
                          src={doc.LINK_XEM_ANH}
                          alt={doc.TEN_LOAI_TAI_LIEU}
                          className="w-20 h-24 object-cover rounded border border-slate-300 shrink-0"
                        />
                        <div className="space-y-1 text-slate-600">
                          <p className="font-semibold text-slate-900">{doc.TEN_LOAI_TAI_LIEU}</p>
                          <p className="text-[11px] line-clamp-3 text-slate-500 italic bg-slate-50 p-1.5 rounded">
                            "{doc.NOI_DUNG_OCR}"
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Tải lên bởi: {doc.NGUOI_TAI_LEN} ({doc.THOI_GIAN_TAI_LEN})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: KIỂM DUYỆT 5 TRẠNG THÁI & GIAO QUÂN */}
          {activeTab === 4 && (
            <div className="space-y-6">
              {/* QA/QC Status Selector */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                  Quy trình Kiểm duyệt Hồ sơ 5 Trạng thái (QA/QC)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                  {[
                    { id: '01_DANG_THU_THAP', label: '1. Đang thu thập' },
                    { id: '02_CHO_KIEM_TRA', label: '2. Chờ kiểm tra' },
                    { id: '03_TRA_LAI_BO_SUNG', label: '3. Trả lại bổ sung' },
                    { id: '04_CAN_XAC_MINH_CONG_AN_Y_TE', label: '4. Cần xác minh CA/YT' },
                    { id: '05_DA_DUYET_HOAN_THIEN', label: '5. Đã duyệt hoàn thiện' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setFormData({ ...formData, TRANG_THAI_HO_SO: st.id as any })}
                      className={`p-2.5 rounded-lg border text-center font-bold transition-all ${
                        formData.TRANG_THAI_HO_SO === st.id
                          ? 'bg-slate-900 text-yellow-400 border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {formData.TRANG_THAI_HO_SO === '03_TRA_LAI_BO_SUNG' && (
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-amber-900 mb-1">
                      Nội dung yêu cầu Khu đội trưởng bổ sung / chỉnh sửa:
                    </label>
                    <textarea
                      rows={2}
                      value={formData.LY_DO_TRA_LAI || ''}
                      onChange={(e) => setFormData({ ...formData, LY_DO_TRA_LAI: e.target.value })}
                      placeholder="Ghi rõ trường dữ liệu thiếu hoặc ảnh chụp giấy tờ bị mờ..."
                      className="w-full p-2.5 text-xs bg-white border border-amber-300 rounded-lg text-slate-900"
                    />
                  </div>
                )}
              </div>

              {/* Quân trang & BHYT (Khoản 3 Điều 6 sửa đổi tại TT 68/2025) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide border-b border-slate-200 pb-2">
                  Quân trang & Bảo hiểm y tế (Cấp trước lễ giao nhận quân 3-5 ngày theo TT 68/2025)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Cỡ mũ:</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 56, 57"
                      value={formData.CO_MU || ''}
                      onChange={(e) => setFormData({ ...formData, CO_MU: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Cỡ giày:</label>
                    <input
                      type="number"
                      placeholder="Ví dụ: 41, 42"
                      value={formData.CO_GIAY || ''}
                      onChange={(e) => setFormData({ ...formData, CO_GIAY: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-300 rounded font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-medium">Cỡ quân phục:</label>
                    <select
                      value={formData.CO_QUAN_AO || 'Số 3'}
                      onChange={(e) => setFormData({ ...formData, CO_QUAN_AO: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                    >
                      <option value="Số 1">Số 1 (Dưới 1m60)</option>
                      <option value="Số 2">Số 2 (1m60 - 1m64)</option>
                      <option value="Số 3">Số 3 (1m65 - 1m69)</option>
                      <option value="Số 4">Số 4 (1m70 - 1m74)</option>
                      <option value="Số 5">Số 5 (Trên 1m75)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <input
                    type="checkbox"
                    id="bhyt"
                    checked={formData.DA_LAP_TO_KHAI_BHYT}
                    onChange={(e) => setFormData({ ...formData, DA_LAP_TO_KHAI_BHYT: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <label htmlFor="bhyt" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Đã lập Tờ khai tham gia Bảo hiểm y tế (BHYT) có xác nhận của UBND cấp xã/phường (Điểm g Khoản 3 Điều 6 TT 68/2025)
                  </label>
                </div>
              </div>

              {/* Thâm nhập Ba gặp Bốn biết */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <label className="block font-bold text-slate-900">
                  Kết quả thâm nhập "Ba gặp, bốn biết" & Di biến động mới phát sinh:
                </label>
                <textarea
                  rows={2}
                  value={formData.KET_QUA_3GAP_4BIET || ''}
                  onChange={(e) => setFormData({ ...formData, KET_QUA_3GAP_4BIET: e.target.value })}
                  placeholder="Ghi tóm tắt: Gặp công dân, gặp gia đình, gặp cơ sở; Biết sức khỏe, biết văn hóa, biết lai lịch, biết hoàn cảnh..."
                  className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-500">
            Cập nhật lần cuối: <strong className="text-slate-800">{formData.THOI_GIAN_CAP_NHAT}</strong> bởi{' '}
            <strong className="text-slate-800">{formData.NGUOI_CAP_NHAT}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSaveAll}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Hồ sơ & Đóng dấu Kiểm toán</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onSavePhoto={(photo) => setFormData({ ...formData, ID_ANH_THE_4X6: photo })}
        hoTen={formData.HO_TEN}
      />

      <SignatureCanvasModal
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onSaveSignature={(signature, gpsInfo) => {
          setFormData({
            ...formData,
            ID_ANH_CHU_KY: signature,
            TOA_DO_GPS: {
              ...gpsInfo,
              diaChiGps: `${gpsInfo.lat}, ${gpsInfo.lng}`,
            },
          });
        }}
        citizenName={formData.HO_TEN}
      />
    </div>
  );
};
