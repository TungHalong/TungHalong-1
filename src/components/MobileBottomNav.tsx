import React from 'react';
import { LayoutDashboard, Users, PlusCircle, FileText, Scale } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCreate: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCreate,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white lg:hidden">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Tab 1: Tổng quan */}
        <button
          onClick={() => onSelectTab('tong_quan')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'tong_quan' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Chỉ tiêu</span>
        </button>

        {/* Tab 2: Danh sách */}
        <button
          onClick={() => onSelectTab('danh_sach')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'danh_sach' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Nguồn NVQS</span>
        </button>

        {/* Action: Quick Create button */}
        <button
          onClick={onOpenCreate}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center -mt-3 text-white"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg flex items-center justify-center border-2 border-slate-900 active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[9px] mt-0.5 font-bold text-emerald-400">Thu thập</span>
        </button>

        {/* Tab 4: Biểu mẫu TT 106 */}
        <button
          onClick={() => onSelectTab('bieu_mau')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'bieu_mau' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Biểu mẫu</span>
        </button>

        {/* Tab 5: Xử phạt NĐ 218 */}
        <button
          onClick={() => onSelectTab('xu_phat')}
          className={`min-h-[48px] min-w-[48px] flex flex-col items-center justify-center transition-colors ${
            activeTab === 'xu_phat' ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Scale className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Xử phạt</span>
        </button>
      </div>
    </nav>
  );
};
