/**
 * NVQS System Types - Based on:
 * - Luật NVQS hợp nhất số 133/2026/VBHN-LQ-VPQH
 * - Thông tư 68/2025/TT-BQP
 * - Thông tư 105/2023/TT-BQP & Thông tư 106/2025/TT-BQP
 * - Nghị định 218/2025/NĐ-CP
 */

// 1. CONG_DAN
export type GioiTinh = 'NAM' | 'NU';

export type TinhTrangCuTru =
  | 'CO_MAT_TAI_DIA_PHUONG'
  | 'DI_HOC_TAP_LAM_AN_XA_CO_DANG_KY'
  | 'TAM_VANG_TREN_3_THANG_CHUA_DANG_KY'
  | 'VANG_MAT_KHONG_RO_NOI_DEN';

export type TrangThaiDkBienDong = 'DUNG_HAN' | 'QUA_HAN_5_NGAY' | 'CHUA_DANG_KY';

export type TrinhDoCMKT = 'KHONG' | 'SO_CAP' | 'TRUNG_CAP' | 'CAO_DANG' | 'DAI_HOC' | 'SAU_DAI_HOC';
export type HeDaoTao = 'CHINH_QUY' | 'KHONG_CHINH_QUY' | 'KHONG_AP_DUNG';

export type DienQuanLyNVQS =
  | 'NHOM_1_KHONG_DUOC_DANG_KY' // Điều 13 Luật NVQS (án tích chưa xóa, đang khởi tố, cải tạo, cai nghiện...)
  | 'NHOM_2_MIEN_DANG_KY' // Điều 14 Luật NVQS (10 bệnh hiểm nghèo Mục III PL I TT 105)
  | 'NHOM_3_HOAN_THANH_TAI_NGU' // Khoản 4 Điều 4 Luật NVQS (DQTT 24T, CAX 36T, SQDB, Đoàn KT-QP...)
  | 'NHOM_4_MIEN_GOI_NHAP_NGU' // Khoản 2 Điều 41 Luật NVQS (con liệt sĩ, TB1, con TB2...)
  | 'NHOM_5_TAM_HOAN_GOI_NHAP_NGU' // Khoản 1 Điều 41 Luật NVQS & TT 68/2025 (sức khỏe, lao động duy nhất, sinh viên...)
  | 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU'; // Đủ điều kiện gọi khám & gọi nhập ngũ

export type PhanLuongTuyenChon = 'NGHIA_VU_QUAN_SU' | 'NGHIA_VU_CONG_AN_NHAN_DAN';

export type PhanLoaiSucKhoe = 'LOAI_1' | 'LOAI_2' | 'LOAI_3' | 'LOAI_4' | 'LOAI_5' | 'LOAI_6' | 'CHUA_KL';

export type TrangThaiHoSo =
  | '01_DANG_THU_THAP'
  | '02_CHO_KIEM_TRA'
  | '03_TRA_LAI_BO_SUNG'
  | '04_CAN_XAC_MINH_CONG_AN_Y_TE'
  | '05_DA_DUYET_HOAN_THIEN';

export interface CongDan {
  // 1. Nhóm Định danh & Quản trị
  MA_HO_SO: string; // CD_000123
  NAM_TUYEN_QUAN: number; // 2026, 2027
  MA_KHU_PHO: string; // KP_01, KP_02...
  HO_TEN: string; // Chuẩn hóa in hoa
  TEN_THUONG_GOI?: string;
  NGAY_SINH: string; // YYYY-MM-DD
  GIOI_TINH: GioiTinh;
  SO_CCCD: string; // 12 số
  DAN_TOC: string;
  TON_GIAO: string;
  QUOC_TICH: string;

  // 2. Nhóm Cư trú & Biến động
  QUE_QUAN: string;
  NOI_DKTT: string;
  CHO_O_HIEN_NAY: string;
  SDT_CONG_DAN: string;
  SDT_GIA_DINH: string;
  TINH_TRANG_CU_TRU: TinhTrangCuTru;
  NOI_LAM_VIEC_TAM_TRU_XA?: string;
  TEN_CO_QUAN_TRUONG_CHU_SDLD?: string;
  NGAY_DI_KHOI_DIA_PHUONG?: string;
  NGAY_TRO_VE?: string;
  TRANG_THAI_DK_BIEN_DONG: TrangThaiDkBienDong;
  CANH_BAO_VI_PHAM_CU_TRU?: string;

  // 3. Nhóm Học vấn, Chuyên môn & Đảng/Đoàn
  TRINH_DO_VAN_HOA: string; // Lớp .../12 (ví dụ: 12/12, 10/12)
  TRINH_DO_CMKT: TrinhDoCMKT;
  TINH_TRANG_DAO_TAO: 'DANG_HOC' | 'DA_TOT_NGHIEP' | 'KHONG_AP_DUNG';
  HE_DAO_TAO: HeDaoTao;
  TEN_TRUONG?: string;
  NGANH_HOC?: string;
  NIEN_KHOA?: string;
  KHOA_DAO_TAO_THU?: number; // 1, 2... Điểm g Khoản 1 Điều 41 Luật NVQS chỉ hoãn 1 khóa
  NGHE_NGHIEP: string;
  NOI_LAM_VIEC?: string;
  THU_NHAP_THANG?: number;
  NGAY_VAO_DOAN?: string;
  NGAY_VAO_DANG?: string;
  DANG_VIEN_CHINH_THUC?: boolean;
  NOI_SINH_HOAT_DANG_DOAN?: string;

  // 4. Nhóm Sơ tuyển & Khám sức khỏe (TT 105/2023, TT 68/2025, TT 106/2025)
  CHIEU_CAO_CM: number; // Sau làm tròn Quân y
  CAN_NANG_KG: number; // Sau làm tròn Quân y
  CHI_SO_BMI: number; // Tự tính
  VONG_NGUC_TB_CM: number; // Sau làm tròn
  MACH_LAN_PHUT?: number;
  HUYET_AP_MMHG?: string; // ví dụ 120/80
  THI_LUC_KHONG_KINH_MP: number; // 1-10
  THI_LUC_KHONG_KINH_MT: number; // 1-10
  THI_LUC_CO_KINH_MP?: number;
  THI_LUC_CO_KINH_MT?: number;
  DO_CAN_THI_D?: number; // Diop
  DO_VIEN_THI_D?: number; // Diop
  LOAN_THI?: boolean;
  TONG_THI_LUC_2_MAT: number;
  DIEM_TRAM_CAM: number; // 0-9
  DIEM_HUNG_CAM: number; // 0-8
  DIEM_TAM_THAN_PHAN_LIET: number; // 0-2
  MA_BENH_MIEN_DK_ICD10?: string; // 10 bệnh Mục III PL I TT 105
  TIEN_SU_BENH_GIA_DINH?: string;
  TIEN_SU_BENH_BAN_THAN?: string;
  NGHIEN_MA_TUY?: boolean;
  DAC_DIEM_HINH_XAM?: string;
  ANH_HINH_XAM?: string;
  KET_LUAN_SO_TUYEN_XA: 'DAT_SO_TUYEN' | 'KHONG_DAT_SO_TUYEN' | 'CHUA_SO_TUYEN';
  LY_DO_SO_TUYEN?: string;
  PHAN_LOAI_KSK_KHU_VUC: PhanLoaiSucKhoe;
  BENH_TAM_THOI_T?: boolean; // Ký hiệu chữ T
  LY_DO_PHAN_LOAI_SK?: string;

  // 5. Nhóm Xét duyệt, Giao quân & Xử lý VPHC
  KET_QUA_BINH_CU_KHU_PHO?: string;
  DIEN_QUAN_LY_NVQS: DienQuanLyNVQS;
  LY_DO_TAM_HOAN_MIEN_CHI_TIET?: string;
  CO_DON_TINH_NGUYEN: boolean;
  PHAN_LUONG_TUYEN_CHON: PhanLuongTuyenChon;
  KET_QUA_DOI_CHIEU_CONG_AN?: 'DAT_TIEU_CHUAN_CT' | 'CAN_XAC_MINH' | 'KHONG_DAT';
  // Quân trang (TT 68/2025 cấp trước 3-5 ngày)
  CO_MU?: string; // 54-58
  CO_GIAY?: number; // 38-44
  CO_QUAN_AO?: string; // Số 1, 2, 3, 4, 5
  DA_LAP_TO_KHAI_BHYT: boolean; // có xác nhận UBND xã
  KET_QUA_3GAP_4BIET?: string;
  // Xử phạt VPHC (NĐ 218/2025)
  HANH_VI_VI_PHAM_NVQS?: string;
  NGAY_GIAO_LENH?: string;
  NGAY_HEN_CO_MAT?: string;
  CO_LY_DO_CHINH_DANG?: boolean;
  CHI_TIET_LY_DO_CHINH_DANG?: string;
  KHUNG_PHAT_TIEN_ND218?: string;
  THAM_QUYEN_XU_PHAT?: string;
  TRANG_THAI_XU_PHAT?: 'CHUA_XU_LY' | 'LAP_BIEN_BAN' | 'RA_QUYET_DINH' | 'DA_NOP_PHAT_DVCQG';
  // Ảnh & Ký số
  ID_ANH_THE_4X6?: string;
  ID_ANH_CHU_KY?: string;
  TOA_DO_GPS?: {
    lat: number;
    lng: number;
    accuracy?: number;
    diaChiGps?: string;
  };
  TRANG_THAI_HO_SO: TrangThaiHoSo;
  LY_DO_TRA_LAI?: string;
  NGUOI_CAP_NHAT: string;
  THOI_GIAN_CAP_NHAT: string;
}

// 2. THAN_NHAN
export type LoaiQuanHe =
  | 'CHA_DE'
  | 'ME_DE'
  | 'CHA_DUONG'
  | 'ME_KE'
  | 'CHA_NUOI'
  | 'ME_NUOI'
  | 'NGUOI_NUOI_DUONG_HOP_PHAP'
  | 'VO'
  | 'CON_DE'
  | 'CON_NUOI'
  | 'ANH_RUOT'
  | 'CHI_RUOT'
  | 'EM_RUOT'
  | 'BAN_THAN_CONG_DAN';

export type TinhTrangTATS = 'KHONG_CO' | 'CO_TIEN_AN_TIEN_SU' | 'DANG_KHOI_TO_DIEU_TRA' | 'CHUA_RO_CAN_XAC_MINH';
export type PhanLoaiViPham = 'TIEN_AN' | 'TIEN_SU_BIEN_PHAP_HC' | 'DANG_TRUY_CUU_TNHS' | 'KHONG_AP_DUNG';

export interface ThanNhan {
  MA_THAN_NHAN: string; // TN_0001
  MA_HO_SO: string; // CD_000123
  LOAI_QUAN_HE: LoaiQuanHe;
  THUOC_NHOM_THAN_NHAN_ND218: boolean; // Khoản 1 Điều 3 NĐ 218/2025
  HO_TEN_THAN_NHAN: string;
  NAM_SINH: number;
  TINH_TRANG_SINH_TU: 'CON_SONG' | 'DA_CHET';
  NAM_CHET?: number;
  NGHE_NGHIEP?: string;
  NOI_CU_TRU?: string;

  // Thái độ chính trị 4 giai đoạn
  TDCT_TRUOC_1945?: string;
  TDCT_1945_1954?: string;
  TDCT_1954_1975?: string;
  TDCT_TU_1975_NAY?: string;
  NGUON_THONG_TIN_TDCT?: string;
  TRANG_THAI_XAC_MINH_TDCT?: 'CHUA_XAC_MINH' | 'DA_XAC_MINH';

  // Tiền án, tiền sự chi tiết
  TINH_TRANG_TATS: TinhTrangTATS;
  PHAN_LOAI_VP?: PhanLoaiViPham;
  TOI_DANH_HANH_VI?: string;
  NAM_XU_LY?: number;
  CO_QUAN_QUYET_DINH?: string;
  SO_BAN_AN_QUYET_DINH?: string;
  MUC_AN_HINH_PHAT?: string;
  NOI_CHAP_HANH?: string;
  THOI_GIAN_CHAP_HANH?: string;
  TINH_TRANG_XOA_AN_TICH?: 'DANG_CHAP_HANH' | 'CHUA_XOA_AN_TICH' | 'DA_XOA_AN_TICH';
  KET_LUAN_THAM_TRA_CA?: string;
}

// 3. TAI_LIEU_ANH (Scan 3 cấp)
export type LoaiTaiLieu =
  | 'CCCD'
  | 'GKS'
  | 'BANG_THPT'
  | 'BANG_CD_DH'
  | 'CHUNG_CHI'
  | 'XAC_NHAN_SV'
  | 'XAC_NHAN_GIA_CANH'
  | 'GIAY_TO_CHINH_SACH'
  | 'QUYET_DINH_DQTT_CAX'
  | 'HO_SO_Y_TE'
  | 'XAC_NHAN_LY_DO_VANG'
  | 'GIAY_TO_PHAP_LY'
  | 'DON_TINH_NGUYEN'
  | 'TO_KHAI_BHYT'
  | 'ANH_XAM'
  | 'ANH_THE_4X6'
  | 'ANH_CHU_KY';

export interface TaiLieuAnh {
  MA_ANH: string; // CD_000123_XNSV_001_001
  MA_TAI_LIEU: string; // CD_000123_XNSV_001
  MA_HO_SO: string; // CD_000123
  LOAI_TAI_LIEU: LoaiTaiLieu;
  TEN_LOAI_TAI_LIEU: string;
  SO_THU_TU_TRANG: number;
  TEN_TEP_DRIVE: string;
  DRIVE_FILE_ID: string;
  LINK_XEM_ANH: string; // Base64 data URL or mock drive url
  NOI_DUNG_OCR?: string;
  TRANG_THAI_KIEM_DUYET_OCR: 'OCR_CHUA_DUYET' | 'OCR_DA_DUYET';
  TRANG_THAI_TEP: 'DANG_SU_DUNG' | 'DA_THAY_THE';
  THAY_THE_CHO_MA_ANH?: string;
  NGUOI_TAI_LEN: string;
  THOI_GIAN_TAI_LEN: string;
}

// 4. TAI_KHOAN
export type VaiTroQuyen = 'ADMIN' | 'KIEM_TRA' | 'Y_TE' | 'CONG_AN' | 'CTV_KHU_PHO';

export interface TaiKhoan {
  MA_TAI_KHOAN: string;
  TEN_DANG_NHAP: string;
  MAT_KHAU_HASH?: string;
  HO_TEN_CAN_BO: string;
  CHUC_VU_DON_VI: string;
  VAI_TRO_QUYEN: VaiTroQuyen;
  MA_KHU_PHO_PHU_TRACH?: string; // Nếu là CTV_KHU_PHO
  SO_DIEN_THOAI: string;
  TRANG_THAI_TK: 'DANG_HOAT_DONG' | 'TAM_KHOA';
  LAN_DANG_NHAP_CUOI: string;
}

// 5. CAU_HINH_LOG
export interface CauHinhHeThong {
  NAM_TUYEN_QUAN_HIEN_TAI: number;
  CHI_TIEU_GIAO_QUAN_PHUONG: number; // Chỉ tiêu tỉnh giao
  DANH_SACH_KHU_PHO: Array<{ ma: string; ten: string }>;
  ID_THU_MUC_DRIVE_GOC: string;
}

export interface NhatKyKiemToan {
  MA_LOG: string;
  THOI_GIAN: string;
  MA_TAI_KHOAN: string;
  TEN_CAN_BO: string;
  MA_HO_SO_TAC_DONG?: string;
  HANH_DONG:
    | 'TAO_MOI'
    | 'CAP_NHAT'
    | 'DUYET'
    | 'TRA_LAI'
    | 'THAY_THE_ANH'
    | 'XUAT_BIEN_BAN_PHAT'
    | 'DONG_BO_DRIVE'
    | 'XUAT_BIEU_MAU';
  CHI_TIET_THAY_DOI: string;
  TOA_DO_GPS_LAT_LNG?: string;
  TRANSACTION_ID: string;
}
