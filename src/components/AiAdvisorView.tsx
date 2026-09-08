import React, { useState } from 'react';
import { FxAccount } from '../types';
import { Sparkles, Copy, Check, FileText, AlertCircle, Loader2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface AiAdvisorViewProps {
  accounts: FxAccount[];
  selectedMonth: string;
}

export const AiAdvisorView: React.FC<AiAdvisorViewProps> = ({ accounts, selectedMonth }) => {
  const [analysisReport, setAnalysisReport] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const validAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));
      const dataSummary = validAccounts.map((acc) => ({
        bank: acc.bankName,
        currency: acc.currency,
        balance: acc.foreignBalance,
        bookRate: acc.bookRate,
        endingRate: acc.endingRate,
        transactionGL: acc.transactionGainLoss,
      }));

      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataSummary, month: selectedMonth }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI 분석 생성 실패');
      }

      setAnalysisReport(data.analysis);
    } catch (err: any) {
      setError(err.message || 'AI 분석 요청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(analysisReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Clean Minimalist Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
        <div className="flex items-center space-x-2 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full w-fit mb-3 text-xs font-semibold text-sky-700">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Gemini AI 재무 분석</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">
          {selectedMonth} 외화 손익 및 환위험 AI 분석
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-5 max-w-2xl">
          등록된 은행별 외화예금 잔액, 기말환율, 환차손익 데이터를 종합 분석하여 경영진 보고용 인사이트와 관리 가이드를 자동 생성합니다.
        </p>
        <button
          onClick={generateReport}
          disabled={loading}
          className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>AI 분석 작성 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI 분석 리포트 생성하기</span>
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200/70 rounded-xl flex items-center space-x-2.5 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Result Container */}
      {analysisReport && (
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 p-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-sky-600" />
              <h4 className="font-bold text-slate-900 text-sm">LX MMA 월간 환위험 분석 보고서</h4>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '복사'}</span>
            </button>
          </div>

          <div className="text-slate-800 text-xs leading-relaxed prose prose-sm max-w-none">
            <Markdown>{analysisReport}</Markdown>
          </div>
        </div>
      )}
    </div>
  );
};
