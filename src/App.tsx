import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { DashboardOverview } from './components/DashboardOverview.tsx';
import { CitizenList } from './components/CitizenList.tsx';
import { CitizenDetailModal } from './components/CitizenDetailModal.tsx';
import { FormsExportModal } from './components/FormsExportModal.tsx';
import { PublicPostingListsModal } from './components/PublicPostingListsModal.tsx';
import { Decree218SanctionModal } from './components/Decree218SanctionModal.tsx';
import { CloudSyncStatusModal } from './components/CloudSyncStatusModal.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import {
  initialCongDan,
  initialThanNhan,
  initialTaiLieuAnh,
  initialTaiKhoan,
  initialCauHinh,
  initialLogs,
} from './data/initialData.ts';
import {
  CongDan,
  ThanNhan,
  TaiLieuAnh,
  TaiKhoan,
  CauHinhHeThong,
  NhatKyKiemToan,
} from './types/nvqs.ts';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  // 5 core tables state with localStorage caching
  const [citizens, setCitizens] = useState<CongDan[]>(() => {
    const saved = localStorage.getItem('NVQS_CONG_DAN');
    return saved ? JSON.parse(saved) : initialCongDan;
  });

  const [thanNhan, setThanNhan] = useState<ThanNhan[]>(() => {
    const saved = localStorage.getItem('NVQS_THAN_NHAN');
    return saved ? JSON.parse(saved) : initialThanNhan;
  });

  const [documents, setDocuments] = useState<TaiLieuAnh[]>(() => {
    const saved = localStorage.getItem('NVQS_TAI_LIEU_ANH');
    return saved ? JSON.parse(saved) : initialTaiLieuAnh;
  });

  const [roles, setRoles] = useState<TaiKhoan[]>(initialTaiKhoan);
  const [currentRole, setCurrentRole] = useState<TaiKhoan>(initialTaiKhoan[0]); // Khu đội trưởng KP 1

  const [cauHinh, setCauHinh] = useState<CauHinhHeThong>(initialCauHinh);
  const [logs, setLogs] = useState<NhatKyKiemToan[]>(() => {
    const saved = localStorage.getItem('NVQS_LOGS');
    return saved ? JSON.parse(saved) : initialLogs;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('danh_sach'); // tong_quan, danh_sach, bieu_mau, niem_yet, xu_phat
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [isMobileDeviceView, setIsMobileDeviceView] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedCitizen, setSelectedCitizen] = useState<CongDan | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isFormsModalOpen, setIsFormsModalOpen] = useState<boolean>(false);
  const [isPublicListsOpen, setIsPublicListsOpen] = useState<boolean>(false);
  const [isSanctionsModalOpen, setIsSanctionsModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Save to localStorage whenever core data changes
  useEffect(() => {
    localStorage.setItem('NVQS_CONG_DAN', JSON.stringify(citizens));
  }, [citizens]);

  useEffect(() => {
    localStorage.setItem('NVQS_THAN_NHAN', JSON.stringify(thanNhan));
  }, [thanNhan]);

  useEffect(() => {
    localStorage.setItem('NVQS_TAI_LIEU_ANH', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('NVQS_LOGS', JSON.stringify(logs));
  }, [logs]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Create new blank citizen
  const handleOpenCreateCitizen = () => {
    const nextNum = citizens.length + 101;
    const newId = `CD_000${nextNum}`;

    const newCitizen: CongDan = {
      MA_HO_SO: newId,
      NAM_TUYEN_QUAN: selectedYear,
      MA_KHU_PHO: currentRole.MA_KHU_PHO_PHU_TRACH || 'KP_01',
      HO_TEN: 'NGUYỄN VĂN MỚI',
      NGAY_SINH: '2008-01-01',
      GIOI_TINH: 'NAM',
      SO_CCCD: `00120800${String(nextNum).slice(-4)}`,
      DAN_TOC: 'Kinh',
      TON_GIAO: 'Không',
      QUOC_TICH: 'Việt Nam',
      QUE_QUAN: 'Phường sở tại',
      NOI_DKTT: `Tổ 1, ${currentRole.MA_KHU_PHO_PHU_TRACH ? 'Khu phố phụ trách' : 'Khu phố 1'}`,
      CHO_O_HIEN_NAY: `Tổ 1, ${currentRole.MA_KHU_PHO_PHU_TRACH ? 'Khu phố phụ trách' : 'Khu phố 1'}`,
      SDT_CONG_DAN: '0900000000',
      SDT_GIA_DINH: '0900000001',
      TINH_TRANG_CU_TRU: 'CO_MAT_TAI_DIA_PHUONG',
      TRANG_THAI_DK_BIEN_DONG: 'DUNG_HAN',
      TRINH_DO_VAN_HOA: '12/12',
      TRINH_DO_CMKT: 'KHONG',
      TINH_TRANG_DAO_TAO: 'KHONG_AP_DUNG',
      HE_DAO_TAO: 'KHONG_AP_DUNG',
      NGHE_NGHIEP: 'Lao động tự do',
      CHIEU_CAO_CM: 168,
      CAN_NANG_KG: 60,
      CHI_SO_BMI: 21.3,
      VONG_NGUC_TB_CM: 82,
      THI_LUC_KHONG_KINH_MP: 10,
      THI_LUC_KHONG_KINH_MT: 10,
      TONG_THI_LUC_2_MAT: 20,
      DIEM_TRAM_CAM: 0,
      DIEM_HUNG_CAM: 0,
      DIEM_TAM_THAN_PHAN_LIET: 0,
      KET_LUAN_SO_TUYEN_XA: 'CHUA_SO_TUYEN',
      PHAN_LOAI_KSK_KHU_VUC: 'CHUA_KL',
      DIEN_QUAN_LY_NVQS: 'NHOM_6_DU_DIEU_KIEN_GOI_KHAM_NHAP_NGU',
      CO_DON_TINH_NGUYEN: false,
      PHAN_LUONG_TUYEN_CHON: 'NGHIA_VU_QUAN_SU',
      DA_LAP_TO_KHAI_BHYT: false,
      TRANG_THAI_HO_SO: '01_DANG_THU_THAP',
      NGUOI_CAP_NHAT: currentRole.TEN_DANG_NHAP,
      THOI_GIAN_CAP_NHAT: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setSelectedCitizen(newCitizen);
    setIsDetailModalOpen(true);
  };

  // Save citizen update
  const handleSaveCitizen = (
    updatedCitizen: CongDan,
    updatedThanNhan: ThanNhan[],
    newDocs: TaiLieuAnh[]
  ) => {
    setCitizens((prev) => {
      const exists = prev.some((c) => c.MA_HO_SO === updatedCitizen.MA_HO_SO);
      if (exists) {
        return prev.map((c) => (c.MA_HO_SO === updatedCitizen.MA_HO_SO ? updatedCitizen : c));
      }
      return [updatedCitizen, ...prev];
    });

    // Update family members
    setThanNhan((prev) => {
      const remaining = prev.filter((tn) => tn.MA_HO_SO !== updatedCitizen.MA_HO_SO);
      return [...remaining, ...updatedThanNhan];
    });

    // Update documents
    setDocuments((prev) => {
      const otherDocs = prev.filter((d) => d.MA_HO_SO !== updatedCitizen.MA_HO_SO);
      return [...otherDocs, ...newDocs];
    });

    // Audit log
    const newLog: NhatKyKiemToan = {
      MA_LOG: `LOG_${Date.now().toString().slice(-6)}`,
      THOI_GIAN: new Date().toISOString().replace('T', ' ').slice(0, 19),
      MA_TAI_KHOAN: currentRole.MA_TAI_KHOAN,
      TEN_CAN_BO: currentRole.HO_TEN_CAN_BO,
      MA_HO_SO_TAC_DONG: updatedCitizen.MA_HO_SO,
      HANH_DONG: 'CAP_NHAT',
      CHI_TIET_THAY_DOI: `Cập nhật hồ sơ ${updatedCitizen.HO_TEN} (${updatedCitizen.DIEN_QUAN_LY_NVQS})`,
      TOA_DO_GPS_LAT_LNG: updatedCitizen.TOA_DO_GPS
        ? `${updatedCitizen.TOA_DO_GPS.lat}, ${updatedCitizen.TOA_DO_GPS.lng}`
        : undefined,
      TRANSACTION_ID: `TX_${Date.now()}`,
    };
    setLogs((prev) => [newLog, ...prev]);

    setOfflineQueue((q) => q + 1);
    showToast(`Đã lưu thành công hồ sơ ${updatedCitizen.HO_TEN}!`);
  };

  // Apply administrative penalty (NĐ 218)
  const handleApplyViolation = (citizenId: string, violationData: any) => {
    setCitizens((prev) =>
      prev.map((c) => {
        if (c.MA_HO_SO === citizenId) {
          return {
            ...c,
            ...violationData,
            NGUOI_CAP_NHAT: currentRole.TEN_DANG_NHAP,
            THOI_GIAN_CAP_NHAT: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return c;
      })
    );

    // Audit log
    const newLog: NhatKyKiemToan = {
      MA_LOG: `LOG_${Date.now().toString().slice(-6)}`,
      THOI_GIAN: new Date().toISOString().replace('T', ' ').slice(0, 19),
      MA_TAI_KHOAN: currentRole.MA_TAI_KHOAN,
      TEN_CAN_BO: currentRole.HO_TEN_CAN_BO,
      MA_HO_SO_TAC_DONG: citizenId,
      HANH_DONG: 'XUAT_BIEN_BAN_PHAT',
      CHI_TIET_THAY_DOI: `Lập biên bản xử phạt VPHC NĐ 218 cho hồ sơ ${citizenId}: ${violationData.HANH_VI_VI_PHAM_NVQS}`,
      TRANSACTION_ID: `TX_${Date.now()}`,
    };
    setLogs((prev) => [newLog, ...prev]);

    showToast('Đã lập dự thảo xử phạt vi phạm hành chính theo Nghị định 218/2025!');
  };

  // Synchronize 2-phase
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setOfflineQueue(0);
    setIsSyncing(false);
    showToast('Đồng bộ 2 pha (Drive & Sheets) thành công!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-20 lg:pb-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentRole={currentRole}
        allRoles={roles}
        onSelectRole={(r) => {
          setCurrentRole(r);
          showToast(`Đã chuyển sang vai trò: ${r.CHUC_VU_DON_VI}`);
        }}
        isMobileView={isMobileDeviceView}
        onToggleMobileView={() => setIsMobileDeviceView(!isMobileDeviceView)}
        selectedYear={selectedYear}
        onChangeYear={setSelectedYear}
        offlineQueueCount={offlineQueue}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          if (tab === 'bieu_mau') {
            setIsFormsModalOpen(true);
          } else if (tab === 'niem_yet') {
            setIsPublicListsOpen(true);
          } else if (tab === 'xu_phat') {
            setIsSanctionsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {/* Mobile Device Frame Simulation if toggled on desktop */}
        {isMobileDeviceView ? (
          <div className="flex justify-center py-4">
            <div className="w-[390px] min-h-[750px] bg-slate-50 border-[6px] border-slate-800 rounded-[38px] shadow-2xl overflow-hidden flex flex-col relative">
              {/* Phone Notch */}
              <div className="h-6 bg-slate-800 w-36 mx-auto rounded-b-xl flex items-center justify-center">
                <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
              </div>

              {/* Mobile Frame Content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 pb-20">
                <div className="bg-emerald-800 text-white p-3 rounded-xl shadow-xs">
                  <div className="text-[11px] font-bold text-yellow-300 uppercase">
                    Giao diện Di động Khu đội trưởng
                  </div>
                  <div className="text-sm font-extrabold">{currentRole.CHUC_VU_DON_VI}</div>
                  <div className="text-[10px] text-emerald-200 mt-0.5">
                    Tác nghiệp phúc tra, chụp ảnh thẻ 4x6, ký tay cảm ứng tại hộ gia đình
                  </div>
                </div>

                {activeTab === 'tong_quan' ? (
                  <DashboardOverview
                    citizens={citizens}
                    cauHinh={cauHinh}
                    onOpenCreateCitizen={handleOpenCreateCitizen}
                    onOpenFormsModal={() => setIsFormsModalOpen(true)}
                    onOpenPublicListsModal={() => setIsPublicListsOpen(true)}
                    onOpenSanctionsModal={() => setIsSanctionsModalOpen(true)}
                    onFilterByStatus={(st) => {
                      setActiveTab('danh_sach');
                    }}
                  />
                ) : (
                  <CitizenList
                    citizens={citizens}
                    currentRole={currentRole}
                    selectedYear={selectedYear}
                    onSelectCitizen={(c) => {
                      setSelectedCitizen(c);
                      setIsDetailModalOpen(true);
                    }}
                    onOpenCreateCitizen={handleOpenCreateCitizen}
                    onOpenFormsForCitizen={(c) => {
                      setSelectedCitizen(c);
                      setIsFormsModalOpen(true);
                    }}
                    onOpenSanctionsForCitizen={(c) => {
                      setSelectedCitizen(c);
                      setIsSanctionsModalOpen(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Normal Responsive Desktop / Mobile Layout */
          <>
            {activeTab === 'tong_quan' ? (
              <DashboardOverview
                citizens={citizens}
                cauHinh={cauHinh}
                onOpenCreateCitizen={handleOpenCreateCitizen}
                onOpenFormsModal={() => setIsFormsModalOpen(true)}
                onOpenPublicListsModal={() => setIsPublicListsOpen(true)}
                onOpenSanctionsModal={() => setIsSanctionsModalOpen(true)}
                onFilterByStatus={(st) => {
                  setActiveTab('danh_sach');
                }}
              />
            ) : (
              <CitizenList
                citizens={citizens}
                currentRole={currentRole}
                selectedYear={selectedYear}
                onSelectCitizen={(c) => {
                  setSelectedCitizen(c);
                  setIsDetailModalOpen(true);
                }}
                onOpenCreateCitizen={handleOpenCreateCitizen}
                onOpenFormsForCitizen={(c) => {
                  setSelectedCitizen(c);
                  setIsFormsModalOpen(true);
                }}
                onOpenSanctionsForCitizen={(c) => {
                  setSelectedCitizen(c);
                  setIsSanctionsModalOpen(true);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation (Visible on mobile screens) */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'bieu_mau') {
            setIsFormsModalOpen(true);
          } else if (tab === 'xu_phat') {
            setIsSanctionsModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenCreate={handleOpenCreateCitizen}
      />

      {/* Citizen Detail & Field Entry Modal */}
      {selectedCitizen && (
        <CitizenDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedCitizen(null);
          }}
          citizen={selectedCitizen}
          allCitizens={citizens}
          allThanNhan={thanNhan}
          allDocuments={documents}
          currentRole={currentRole}
          cauHinh={cauHinh}
          onSaveCitizen={handleSaveCitizen}
          onOpenFormsModal={(c) => {
            setSelectedCitizen(c);
            setIsFormsModalOpen(true);
          }}
          onOpenSanctionsModal={(c) => {
            setSelectedCitizen(c);
            setIsSanctionsModalOpen(true);
          }}
        />
      )}

      {/* Forms Modal (TT 106/2025) */}
      <FormsExportModal
        isOpen={isFormsModalOpen}
        onClose={() => setIsFormsModalOpen(false)}
        citizens={citizens}
        allThanNhan={thanNhan}
        cauHinh={cauHinh}
        selectedCitizenId={selectedCitizen?.MA_HO_SO}
      />

      {/* 07 Public Posting Lists Modal (TT 68/2025) */}
      <PublicPostingListsModal
        isOpen={isPublicListsOpen}
        onClose={() => setIsPublicListsOpen(false)}
        citizens={citizens}
        cauHinh={cauHinh}
      />

      {/* Decree 218 Administrative Sanction Advisor Modal */}
      <Decree218SanctionModal
        isOpen={isSanctionsModalOpen}
        onClose={() => setIsSanctionsModalOpen(false)}
        citizen={selectedCitizen || undefined}
        citizens={citizens}
        onApplyViolation={handleApplyViolation}
      />

      {/* Cloud Sync Status Modal */}
      <CloudSyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        cauHinh={cauHinh}
        documents={documents}
        citizens={citizens}
        onTriggerSync={handleTriggerSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}
