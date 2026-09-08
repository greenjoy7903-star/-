import React, { useState } from 'react';
import { Database, Copy, Check, X, ShieldCheck } from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../lib/supabase';

interface SqlScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlScriptModal: React.FC<SqlScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Supabase DB 스키마 & RLS 정책 SQL</h3>
              <p className="text-[11px] text-slate-500">외화 손익 누적 저장 테이블 생성 스크립트</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl text-slate-700 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>적용 안내:</strong> Supabase 프로젝트 웹 콘솔 &gt; <strong>SQL Editor</strong> 메뉴에서 [New query]를 누르고 아래 SQL을 복사하여 실행([Run])해 주세요.
              테이블(<code>fx_records</code>) 생성과 인가된 사용자(authenticated) 전용 Row Level Security (RLS) 정책이 즉시 활성화됩니다.
            </div>
          </div>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-80 leading-relaxed">
              {SUPABASE_SETUP_SQL}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사되었습니다' : 'SQL 전체 복사'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            환경 변수: <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
