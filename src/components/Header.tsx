import React from 'react';
import { Building2, Calendar, FileSpreadsheet, HelpCircle, PlusCircle, Globe, RefreshCw } from 'lucide-react';

interface HeaderProps {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  onOpenAddModal: () => void;
  onOpenGuideModal: () => void;
  onExportExcel: () => void;
  onResetData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedMonth,
  setSelectedMonth,
  onOpenAddModal,
  onOpenGuideModal,
  onExportExcel,
  onResetData,
  activeTab,
  setActiveTab,
}) => {
  const months = ['2026년 5월', '2026년 6월', '2026년 7월', '2026년 8월 (현재)', '2026년 9월 (예상)'];

  const tabs = [
    { id: 'table', label: '외화 계좌 및 손익' },
    { id: 'detail', label: '통화별 상세 손익' },
    { id: 'fs-impact', label: '재무제표 영향' },
    { id: 'charts', label: '월별 트렌드' },
    { id: 'simulation', label: '환율 시뮬레이션' },
    { id: 'ai', label: 'AI 재무 분석' },
  ];

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Simple Clear Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-semibold tracking-tight px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  (주) LX MMA
                </span>
                <span className="text-[11px] text-slate-400 font-medium">재무 자금팀</span>
                <span className="hidden sm:inline-flex items-center text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                  <Globe className="w-3 h-3 mr-1" />
                  실시간 공유
                </span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                외화 손익 관리 대시보드
              </h1>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Month Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer pr-1 text-slate-800 font-medium"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Account Button */}
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>계좌 등록</span>
            </button>

            {/* Excel Download */}
            <button
              onClick={onExportExcel}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition"
              title="엑셀(CSV) 다운로드"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">엑셀</span>
            </button>

            {/* Reset */}
            <button
              onClick={onResetData}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition border border-slate-200"
              title="데이터 초기화"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Guide */}
            <button
              onClick={onOpenGuideModal}
              className="inline-flex items-center space-x-1 bg-amber-50/80 hover:bg-amber-100/70 text-amber-800 border border-amber-200/70 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>가이드</span>
            </button>
          </div>
        </div>

        {/* Minimalist Tab Navigation */}
        <div className="flex space-x-1 mt-4 p-1 bg-slate-100/70 rounded-xl overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition font-medium ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
