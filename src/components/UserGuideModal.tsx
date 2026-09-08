import React from 'react';
import { X, HelpCircle, Building2, Globe, Calculator } from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">외화 손익 대시보드 이용 가이드</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-slate-600 text-xs leading-relaxed">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>대시보드 개요 및 목적</span>
            </h4>
            <p>
              (주) LX MMA 재무 자금 실무에서 지정 은행(신한은행, 우리은행, 하나은행, 국민은행, 신한은행(독일)) 및 주력 통화(USD, EUR, JPY) 외화예금의 환산손익(평가)과 환차손익(실현)을 직관적으로 통합 관리합니다.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>손익 산식 및 표기 규칙</span>
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/70 space-y-1.5 font-mono text-[11px]">
              <div>• 외화환산손익 = (기말환율 - 장부지가) × 외화잔액</div>
              <div>• 손실(음수) 금액: <code>▲</code> 기호 및 빨간색 강조 표시</div>
              <div>• 이익(양수) 금액: <code>+</code> 기호 없이 검정색 일반 표시</div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>실무 활용 팁</span>
            </h4>
            <p>
              기말환율 변경 시 모든 연동 손익과 재무제표 영향이 실시간 반영되며, 상단의 [엑셀] 버튼으로 원클릭 리포트를 다운로드할 수 있습니다.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition"
          >
            확인
          </button>
        </div>

      </div>
    </div>
  );
};
