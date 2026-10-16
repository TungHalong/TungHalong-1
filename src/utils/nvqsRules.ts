/**
 * Core business rules, algorithms, and validation guards
 * Compliant with:
 * - Luật NVQS hợp nhất số 133/2026/VBHN-LQ-VPQH
 * - Thông tư số 68/2025/TT-BQP
 * - Thông tư số 105/2023/TT-BQP & Thông tư 106/2025/TT-BQP
 * - Nghị định số 218/2025/NĐ-CP
 */

/**
 * 1. QUY TẮC LÀM TRÒN QUÂN Y (Mục IV Phụ lục I TT 105/2023)
 * Phần lẻ từ 0,50 trở lên quy tròn thành 1 đơn vị, từ 0,49 trở xuống bỏ phần lẻ.
 * Áp dụng cho: Chiều cao (cm), Cân nặng (kg), Vòng ngực trung bình (cm).
 */
export function roundQuanY(val: number): number {
  if (isNaN(val)) return 0;
  const integerPart = Math.floor(val);
  const fractionalPart = val - integerPart;
  // Use precision tolerance for floating point representations (e.g. 0.4999999999)
  if (fractionalPart >= 0.49999) {
    return integerPart + 1;
  }
  return integerPart;
}

/**
 * Tính chỉ số BMI và làm tròn 1 chữ số thập phân
 * BMI = Cân nặng (kg) / (Chiều cao (m))^2
 */
export function calculateBMI(heightCm: number, weightKg: number): number {
  const roundedHeight = roundQuanY(heightCm);
  const roundedWeight = roundQuanY(weightKg);
  if (roundedHeight <= 0 || roundedWeight <= 0) return 0;
  const heightM = roundedHeight / 100;
  const bmi = roundedWeight / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Kiểm tra chốt chặn BMI theo Điểm c Khoản 3 Điều 4 Thông tư 148 sửa đổi tại TT 68/2025/TT-BQP:
 * "Không gọi nhập ngũ vào Quân đội những công dân... có chỉ số BMI nhỏ hơn 18.0 hoặc lớn hơn 29.9."
 */
export interface BmiValidationResult {
  bmi: number;
  isEligible: boolean;
  classification: string;
  warningMessage?: string;
}

export function validateBmiTT68(heightCm: number, weightKg: number): BmiValidationResult {
  const bmi = calculateBMI(heightCm, weightKg);
  if (bmi <= 0) {
    return { bmi: 0, isEligible: false, classification: 'CHƯA_XÁC_ĐỊNH' };
  }

  let classification = 'Bình thường (18.5 - 24.9)';
  if (bmi < 18.0) {
    classification = 'Thiếu cân nghiêm trọng (< 18.0)';
  } else if (bmi < 18.5) {
    classification = 'Hơi gầy (18.0 - 18.4)';
  } else if (bmi <= 24.9) {
    classification = 'Chuẩn thể lực Loại 1-2 (18.5 - 24.9)';
  } else if (bmi <= 26.9) {
    classification = 'Thừa cân nhẹ Loại 2 (25.0 - 26.9)';
  } else if (bmi <= 29.9) {
    classification = 'Thừa cân Loại 3 (27.0 - 29.9)';
  } else {
    classification = 'Béo phì (>= 30.0)';
  }

  if (bmi < 18.0 || bmi > 29.9) {
    return {
      bmi,
      isEligible: false,
      classification,
      warningMessage:
        'CẢNH BÁO ĐỎ: Không gọi nhập ngũ vào Quân đội theo điểm c khoản 3 Điều 4 Thông tư 148 sửa đổi tại Thông tư 68/2025/TT-BQP (Chỉ số BMI < 18.0 hoặc > 29.9).',
    };
  }

  return {
    bmi,
    isEligible: true,
    classification,
  };
}

/**
 * 2. KIỂM SOÁT THỊ LỰC VÀ TẬT KHÚC XẠ (TT 68/2025 & TT 106/2025)
 * - Tổng thị lực 2 mắt: nếu 1 mắt > 10/10 vẫn chỉ tính tối đa 10/10. Thị lực mắt trái không bù được cho mắt phải.
 * - Chốt chặn: Cận thị > 1.5 Diop trở lên hoặc viễn thị các mức độ -> Không gọi nhập ngũ vào Quân đội.
 */
export interface VisionValidationResult {
  totalVision: number;
  isEligible: boolean;
  warningMessage?: string;
}

export function calculateTotalVision(rightEye: number, leftEye: number): number {
  const r = Math.min(Math.max(rightEye, 0), 10);
  const l = Math.min(Math.max(leftEye, 0), 10);
  return r + l;
}

export function validateVisionTT68(params: {
  rightEyeWithoutGlasses: number;
  leftEyeWithoutGlasses: number;
  myopiaDiop?: number; // Cận thị
  hyperopiaDiop?: number; // Viễn thị
  astigmatism?: boolean; // Loạn thị
}): VisionValidationResult {
  const total = calculateTotalVision(params.rightEyeWithoutGlasses, params.leftEyeWithoutGlasses);
  const myopia = params.myopiaDiop || 0;
  const hyperopia = params.hyperopiaDiop || 0;

  // Điểm c Khoản 3 Điều 4 TT 148 sửa đổi tại TT 68/2025:
  // "Không gọi nhập ngũ vào Quân đội những công dân mắc tật khúc xạ cận thị lớn hơn 1.5 diop trở lên, viễn thị các mức độ;"
  if (myopia > 1.5) {
    return {
      totalVision: total,
      isEligible: false,
      warningMessage: `CẢNH BÁO ĐỎ: Cận thị ${myopia}D (> 1.5 diop) - Không gọi nhập ngũ vào Quân đội theo Thông tư 68/2025/TT-BQP.`,
    };
  }

  if (hyperopia > 0) {
    return {
      totalVision: total,
      isEligible: false,
      warningMessage: `CẢNH BÁO ĐỎ: Mắc viễn thị ${hyperopia}D các mức độ - Không gọi nhập ngũ vào Quân đội theo Thông tư 68/2025/TT-BQP.`,
    };
  }

  return {
    totalVision: total,
    isEligible: true,
  };
}

/**
 * 3. 10 BỆNH THUỘC DANH MỤC MIỄN ĐĂNG KÝ NVQS (Mục III Phụ lục I TT 105/2023)
 */
export interface ExemptDiseaseInfo {
  stt: number;
  tenBenh: string;
  maICD10: string;
}

export const DANH_MUC_10_BENH_MIEN_DK: ExemptDiseaseInfo[] = [
  { stt: 1, tenBenh: 'Tâm thần', maICD10: 'F20 đến F29' },
  { stt: 2, tenBenh: 'Động kinh', maICD10: 'G40' },
  { stt: 3, tenBenh: 'Bệnh Parkinson', maICD10: 'G20' },
  { stt: 4, tenBenh: 'Mù một mắt', maICD10: 'H54.4' },
  { stt: 5, tenBenh: 'Điếc', maICD10: 'H90' },
  { stt: 6, tenBenh: 'Di chứng do lao xương khớp', maICD10: 'B90.2' },
  { stt: 7, tenBenh: 'Di chứng do phong', maICD10: 'B92' },
  { stt: 8, tenBenh: 'Các bệnh lý ác tính (U ác, bệnh máu ác tính)', maICD10: 'C00 đến C97; D00 đến D09; D45 đến D47' },
  { stt: 9, tenBenh: 'Người nhiễm HIV', maICD10: 'B20 đến B24; Z21' },
  { stt: 10, tenBenh: 'Người khuyết tật mức độ đặc biệt nặng và nặng', maICD10: 'N/A' },
];

/**
 * 4. PHIẾU CHẨN ĐOÁN NHANH BỆNH TÂM THẦN THƯỜNG GẶP (Phụ lục III TT 105/2023 & TT 106/2025)
 */
export function evaluateDepressionScore(score: number): 'BÌNH_THƯỜNG' | 'NGHI_NGỜ' | 'XÁC_ĐỊNH' {
  if (score <= 2) return 'BÌNH_THƯỜNG';
  if (score <= 4) return 'NGHI_NGỜ';
  return 'XÁC_ĐỊNH';
}

export function evaluateManiaScore(score: number): 'BÌNH_THƯỜNG' | 'NGHI_NGỜ' | 'XÁC_ĐỊNH' {
  if (score <= 2) return 'BÌNH_THƯỜNG';
  if (score <= 4) return 'NGHI_NGỜ';
  return 'XÁC_ĐỊNH';
}

export function evaluateSchizophreniaScore(score: number): 'BÌNH_THƯỜNG' | 'XÁC_ĐỊNH' {
  if (score >= 1) return 'XÁC_ĐỊNH';
  return 'BÌNH_THƯỜNG';
}

/**
 * 5. KIỂM SOÁT THỜI HẠN VÀ BIẾN ĐỘNG CƯ TRÚ (Điều 17 Luật NVQS & Điều 8 Nghị định 218/2025)
 */
export interface ResidenceCheckResult {
  hasViolation: boolean;
  violationCode?: string;
  violationText?: string;
  suggestedFineText?: string;
}

export function checkResidenceDeadlines(params: {
  tinhTrangCuTru: string;
  ngayDiKhoiDiaPhuong?: string;
  ngayTroVe?: string;
  daDangKyBienDong: boolean;
  soNgayLamViecChuaDangKy?: number;
  currentDate?: string;
}): ResidenceCheckResult {
  const days = params.soNgayLamViecChuaDangKy || 0;

  // Nếu công dân thay đổi nơi cư trú / làm việc quá 05 ngày làm việc chưa đăng ký chuyển đến
  if (!params.daDangKyBienDong && days > 5) {
    return {
      hasViolation: true,
      violationCode: 'ND218_D8_K2D',
      violationText: `Quá hạn ${days} ngày làm việc chưa làm thủ tục đăng ký nghĩa vụ quân sự chuyển đến (Điểm d Khoản 2 Điều 8 Nghị định 218/2025).`,
      suggestedFineText: 'Phạt tiền từ 8.000.000đ đến 10.000.000đ (Buộc thực hiện đăng ký chuyển đến).',
    };
  }

  // Tạm vắng từ 3 tháng trở lên chưa đăng ký
  if (params.tinhTrangCuTru === 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY') {
    return {
      hasViolation: true,
      violationCode: 'ND218_D8_K2D_VANG',
      violationText: 'Đi khỏi nơi cư trú hoặc nơi làm việc, học tập từ 03 tháng trở lên không đăng ký NVQS tạm vắng (Điểm đ Khoản 2 Điều 8 Nghị định 218/2025).',
      suggestedFineText: 'Phạt tiền từ 8.000.000đ đến 10.000.000đ (Buộc thực hiện đăng ký NVQS tạm vắng).',
    };
  }

  return { hasViolation: false };
}

/**
 * 6. ĐỊNH KHUNG PHẠT VÀ THẨM QUYỀN XỬ PHẠT (Nghị định 218/2025/NĐ-CP)
 */
export interface PenaltyGuidance {
  hanhVi: string;
  dieuKhoan: string;
  mucPhatMin: number;
  mucPhatMax: number;
  khungPhatText: string;
  bienPhapKhacPhuc: string;
  thamQuyen: string;
  capThamQuyen: 'CHU_TICH_UBND_XA' | 'TRUONG_CA_XA' | 'CHU_TICH_UBND_TINH' | 'GIAM_DOC_CA_TINH' | 'HINH_SU';
}

export const DANH_MUC_VI_PHAM_ND218: Record<string, PenaltyGuidance> = {
  // Điều 8: Đăng ký NVQS
  D8_K1: {
    hanhVi: 'Không đăng ký nghĩa vụ quân sự lần đầu đối với công dân nam đủ 17 tuổi trong năm',
    dieuKhoan: 'Khoản 1 Điều 8 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 0,
    mucPhatMax: 0,
    khungPhatText: 'Phạt cảnh cáo',
    bienPhapKhacPhuc: 'Buộc thực hiện thủ tục đăng ký NVQS lần đầu',
    thamQuyen: 'Chủ tịch UBND cấp xã (Khoản 1 Điều 52)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D8_K2: {
    hanhVi: 'Tái phạm không đăng ký NVQS lần đầu / Không đăng ký bổ sung / Không đăng ký chuyển đến trong 05 ngày làm việc / Không đăng ký tạm vắng >= 03 tháng hoặc về quá 05 ngày làm việc không đăng ký lại',
    dieuKhoan: 'Khoản 2 Điều 8 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 8000000,
    mucPhatMax: 10000000,
    khungPhatText: '8.000.000đ - 10.000.000đ',
    bienPhapKhacPhuc: 'Buộc thực hiện thủ tục đăng ký theo quy định',
    thamQuyen: 'Chủ tịch UBND cấp xã (Khoản 1 Điều 52)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  // Điều 9: Sơ tuyển & Khám sức khỏe
  D9_K1: {
    hanhVi: 'Không có mặt đúng thời gian hoặc địa điểm tập trung sơ tuyển ghi trong quyết định gọi sơ tuyển mà không có lý do chính đáng',
    dieuKhoan: 'Khoản 1 Điều 9 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 3000000,
    mucPhatMax: 5000000,
    khungPhatText: '3.000.000đ - 5.000.000đ',
    bienPhapKhacPhuc: 'Buộc có mặt thực hiện sơ tuyển',
    thamQuyen: 'Chủ tịch UBND cấp xã (K1 Điều 52) hoặc Trưởng Công an cấp xã (K4 Điều 54)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D9_K2: {
    hanhVi: 'Không nhận quyết định gọi sơ tuyển sức khỏe nghĩa vụ quân sự mà không có lý do chính đáng',
    dieuKhoan: 'Khoản 2 Điều 9 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 5000000,
    mucPhatMax: 8000000,
    khungPhatText: '5.000.000đ - 8.000.000đ',
    bienPhapKhacPhuc: 'Buộc nhận quyết định và thực hiện sơ tuyển',
    thamQuyen: 'Chủ tịch UBND cấp xã (K1 Điều 52) hoặc Trưởng Công an cấp xã (K4 Điều 54)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D9_K3: {
    hanhVi: 'Không có mặt đúng thời gian hoặc địa điểm khám sức khỏe ghi trong quyết định gọi khám sức khỏe mà không có lý do chính đáng',
    dieuKhoan: 'Khoản 3 Điều 9 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 15000000,
    mucPhatMax: 20000000,
    khungPhatText: '15.000.000đ - 20.000.000đ',
    bienPhapKhacPhuc: 'Buộc chấp hành quyết định gọi khám sức khỏe',
    thamQuyen: 'Chủ tịch UBND cấp xã (K1 Điều 52) hoặc Trưởng Công an cấp xã (K4 Điều 54)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D9_K4: {
    hanhVi: 'Cản trở công dân nhận quyết định gọi khám sức khỏe hoặc không nhận quyết định gọi khám sức khỏe mà không có lý do chính đáng',
    dieuKhoan: 'Khoản 4 Điều 9 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 20000000,
    mucPhatMax: 30000000,
    khungPhatText: '20.000.000đ - 30.000.000đ',
    bienPhapKhacPhuc: 'Buộc nhận quyết định và chấm dứt hành vi cản trở',
    thamQuyen: 'Chủ tịch UBND cấp xã (K1 Điều 52) hoặc Trưởng Công an cấp xã (K4 Điều 54)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D9_K5: {
    hanhVi: 'Gian dối làm sai lệch kết quả phân loại sức khỏe nhằm trốn tránh NVQS hoặc đưa tiền/tài sản dưới 2.000.000đ cho cán bộ y tế để làm sai lệch kết quả',
    dieuKhoan: 'Khoản 5 Điều 9 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 30000000,
    mucPhatMax: 40000000,
    khungPhatText: '30.000.000đ - 40.000.000đ',
    bienPhapKhacPhuc: 'Buộc thực hiện NVQS theo quy định tại Khoản 6 Điều 6; Nộp lại lợi ích bất hợp pháp',
    thamQuyen: 'Mức phạt trung bình (35tr) thuộc Chủ tịch UBND xã; nếu áp mức tối đa (40tr) chuyển Chủ tịch UBND tỉnh',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D9_K6: {
    hanhVi: 'Không chấp hành quyết định gọi kiểm tra, khám sức khỏe nghĩa vụ quân sự',
    dieuKhoan: 'Khoản 6 Điều 9 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 50000000,
    mucPhatMax: 75000000,
    khungPhatText: '50.000.000đ - 75.000.000đ',
    bienPhapKhacPhuc: 'Buộc chấp hành quyết định gọi kiểm tra, khám sức khỏe NVQS',
    thamQuyen: 'Chủ tịch UBND cấp tỉnh (K2 Điều 52) hoặc Giám đốc Công an cấp tỉnh (K7 Điều 54)',
    capThamQuyen: 'CHU_TICH_UBND_TINH',
  },
  // Điều 10: Nhập ngũ
  D10_K1: {
    hanhVi: 'Không có mặt đúng thời gian hoặc địa điểm tập trung ghi trong quyết định gọi nhập ngũ mà không có lý do chính đáng',
    dieuKhoan: 'Khoản 1 Điều 10 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 30000000,
    mucPhatMax: 40000000,
    khungPhatText: '30.000.000đ - 40.000.000đ',
    bienPhapKhacPhuc: 'Buộc chấp hành quyết định gọi nhập ngũ',
    thamQuyen: 'Chủ tịch UBND cấp xã (phạt đến 37.5tr) hoặc Chủ tịch UBND cấp tỉnh (> 37.5tr)',
    capThamQuyen: 'CHU_TICH_UBND_XA',
  },
  D10_K2: {
    hanhVi: 'Cản trở công dân thực hiện quyết định gọi nhập ngũ; Gian dối nhằm trốn tránh thực hiện quyết định gọi nhập ngũ sau khi đã khám đủ điều kiện',
    dieuKhoan: 'Khoản 2 Điều 10 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 40000000,
    mucPhatMax: 50000000,
    khungPhatText: '40.000.000đ - 50.000.000đ',
    bienPhapKhacPhuc: 'Buộc thực hiện nghĩa vụ quân sự (Khoản 4 Điều 10)',
    thamQuyen: 'Chủ tịch UBND cấp tỉnh (K2 Điều 52) hoặc Giám đốc Công an cấp tỉnh (K7 Điều 54)',
    capThamQuyen: 'CHU_TICH_UBND_TINH',
  },
  D10_K3: {
    hanhVi: 'Không chấp hành quyết định gọi nhập ngũ (trừ trường hợp K1, K2)',
    dieuKhoan: 'Khoản 3 Điều 10 Nghị định 218/2025/NĐ-CP',
    mucPhatMin: 50000000,
    mucPhatMax: 75000000,
    khungPhatText: '50.000.000đ - 75.000.000đ',
    bienPhapKhacPhuc: 'Buộc thực hiện NVQS; Xem xét chuyển truy cứu trách nhiệm hình sự nếu có dấu hiệu tội phạm trốn tránh NVQS',
    thamQuyen: 'Chủ tịch UBND cấp tỉnh (K2 Điều 52) / Chuyển Cơ quan điều tra (Khoản 2 Điều 6)',
    capThamQuyen: 'CHU_TICH_UBND_TINH',
  },
};

/**
 * 7. KIỂM SOÁT TỶ LỆ KHỐNG CHẾ & CHỈ TIÊU (TT 68/2025/TT-BQP)
 */
export interface QuotaAuditResult {
  soLuongGoiKham: number;
  chiTieuPhuong: number;
  tyLeGoiKhamPercent: number;
  vuotTyLeGoiKham: boolean; // Vượt quá 400% (4 lần chỉ tiêu)
  soLuongDuPhong: number;
  chiTieuGiaoQuan: number;
  tyLeDuPhongPercent: number;
  vuotTyLeDuPhong: boolean; // Vượt quá 5%
  canhBao?: string[];
}

export function auditQuotasTT68(params: {
  soLuongGoiKham: number;
  chiTieuPhuong: number;
  soLuongDuPhong: number;
  chiTieuGiaoQuan: number;
}): QuotaAuditResult {
  const chiTieu = Math.max(params.chiTieuPhuong, 1);
  const tyLeGoiKhamPercent = Math.round((params.soLuongGoiKham / chiTieu) * 100);
  const vuotTyLeGoiKham = tyLeGoiKhamPercent > 400;

  const chiTieuGiao = Math.max(params.chiTieuGiaoQuan, 1);
  const tyLeDuPhongPercent = Math.round((params.soLuongDuPhong / chiTieuGiao) * 1000) / 10;
  const vuotTyLeDuPhong = tyLeDuPhongPercent > 5.0;

  const canhBao: string[] = [];
  if (vuotTyLeGoiKham) {
    canhBao.push(
      `CẢNH BÁO QUÂN LỰC: Gọi khám sức khỏe ${params.soLuongGoiKham} công dân (${tyLeGoiKhamPercent}%) vượt quá 04 lần (400%) so với chỉ tiêu ${chiTieu} (Điểm đ Khoản 2 và Điểm c Khoản 3 Điều 6 TT 68/2025/TT-BQP).`
    );
  }
  if (vuotTyLeDuPhong) {
    canhBao.push(
      `CẢNH BÁO GIAO QUÂN: Quân số dự phòng phát lệnh gọi nhập ngũ đạt ${tyLeDuPhongPercent}% vượt quá tỷ lệ khống chế tối đa 5% so với chỉ tiêu ${chiTieuGiao} (Điểm đ Khoản 2 Điều 6 TT 68/2025/TT-BQP).`
    );
  }

  return {
    soLuongGoiKham: params.soLuongGoiKham,
    chiTieuPhuong: chiTieu,
    tyLeGoiKhamPercent,
    vuotTyLeGoiKham,
    soLuongDuPhong: params.soLuongDuPhong,
    chiTieuGiaoQuan: chiTieuGiao,
    tyLeDuPhongPercent,
    vuotTyLeDuPhong,
    canhBao: canhBao.length > 0 ? canhBao : undefined,
  };
}

/**
 * 8. TỰ ĐỘNG PHÂN BIỆT NHÓM THÂN NHÂN THEO NGHỊ ĐỊNH 218/2025/NĐ-CP (Khoản 1 Điều 3)
 * Thân nhân hợp pháp tính lý do chính đáng:
 * Cha đẻ, mẹ đẻ; cha vợ, mẹ vợ hoặc cha chồng, mẹ chồng; cha nuôi, mẹ nuôi; người nuôi dưỡng hợp pháp; vợ hoặc chồng; con đẻ, con nuôi.
 */
export function isThanNhanHopPhapND218(loaiQuanHe: string): boolean {
  const hopPhap = [
    'CHA_DE',
    'ME_DE',
    'CHA_DUONG',
    'ME_KE',
    'CHA_NUOI',
    'ME_NUOI',
    'NGUOI_NUOI_DUONG_HOP_PHAP',
    'VO',
    'CON_DE',
    'CON_NUOI',
  ];
  return hopPhap.includes(loaiQuanHe);
}
