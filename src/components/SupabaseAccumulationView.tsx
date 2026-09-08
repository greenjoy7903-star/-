import React, { useState, useEffect, useRef } from 'react';
import { FxAccount, Currency } from '../types';
import { supabase, isSupabaseConfigured, FxDbRecord, SUPABASE_SETUP_SQL } from '../lib/supabase';
import { ALLOWED_BANKS } from './BankCurrencyTable';
import { calculateTranslationGainLoss, formatKRW, formatForeign } from '../utils/formatters';
import {
  UploadCloud,
  Database,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  Building2,
  ArrowDownToLine,
  History,
  Layers,
} from 'lucide-react';

interface SupabaseAccumulationViewProps {
  currentAccounts: FxAccount[];
  selectedMonth: string;
  userEmail: string;
  onApplyHistoricalDataToDashboard?: (accounts: FxAccount[], month: string) => void;
}

export const SupabaseAccumulationView: React.FC<SupabaseAccumulationViewProps> = ({
  currentAccounts,
  selectedMonth,
  userEmail,
  onApplyHistoricalDataToDashboard,
}) => {
  const [csvPreview, setCsvPreview] = useState<FxDbRecord[]>([]);
  const [uploadMonth, setUploadMonth] = useState<string>(selectedMonth);
  const [uploading, setUploading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Supabase accumulated records state
  const [dbRecords, setDbRecords] = useState<FxDbRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [filterMonth, setFilterMonth] = useState<string>('ALL');
  const [filterBank, setFilterBank] = useState<string>('ALL');

  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isConfigured = isSupabaseConfigured();

  // Load accumulated history from Supabase (or local fallback for demo)
  const fetchAccumulatedRecords = async () => {
    setLoadingHistory(true);
    try {
      if (isConfigured && supabase) {
        const { data, error } = await supabase
          .from('fx_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDbRecords(data || []);
      } else {
        // LocalStorage fallback for demo mode
        const saved = localStorage.getItem('lx_mma_supabase_demo_records');
        if (saved) {
          setDbRecords(JSON.parse(saved));
        } else {
          // Pre-seed with existing initial accounts as demo accumulated data
          const initialMockDb: FxDbRecord[] = currentAccounts.map((acc, idx) => {
            const transGL = calculateTranslationGainLoss(acc.foreignBalance, acc.endingRate, acc.bookRate);
            return {
              id: `demo-${idx + 1}`,
              created_at: new Date(Date.now() - idx * 86400000).toISOString(),
              record_month: selectedMonth,
              bank_name: acc.bankName,
              account_number: acc.accountNumber,
              currency: acc.currency,
              foreign_balance: acc.foreignBalance,
              book_rate: acc.bookRate,
              ending_rate: acc.endingRate,
              transaction_gain_loss: acc.transactionGainLoss,
              translation_gain_loss: transGL,
              total_gain_loss: transGL + acc.transactionGainLoss,
              uploaded_by: userEmail,
            };
          });
          setDbRecords(initialMockDb);
          localStorage.setItem('lx_mma_supabase_demo_records', JSON.stringify(initialMockDb));
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch records:', err);
      setStatusMessage({ type: 'error', text: `누적 기록 조회 실패: ${err.message}` });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAccumulatedRecords();
  }, [isConfigured]);

  // Parse CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCsvText(text);
    };
    reader.readAsText(file, 'utf-8');
  };

  const parseCsvText = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setStatusMessage({ type: 'error', text: 'CSV 파일에 데이터 행이 부족합니다.' });
        return;
      }

      const rows: FxDbRecord[] = [];

      // Loop through lines starting from 1 (skipping header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        // Split by comma taking quotes into account
        const cells = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim());

        if (cells.length < 5) continue;

        let bank = cells[0] || '신한은행';
        if (bank.includes('국민') && !bank.includes('독일')) bank = '국민은행';
        if (bank.includes('독일')) bank = '신한은행(독일)';

        const accountNum = cells[1] || '110-***-***';
        const curr = (cells[2]?.toUpperCase() || 'USD') as Currency;
        const foreignBal = parseFloat(cells[3]?.replace(/,/g, '')) || 0;
        const bookRate = parseFloat(cells[4]?.replace(/,/g, '')) || 1350;
        const endingRate = parseFloat(cells[5]?.replace(/,/g, '')) || bookRate;
        const transactionGL = cells[7] ? parseFloat(cells[7]?.replace(/,/g, '')) || 0 : (cells[6] ? parseFloat(cells[6]?.replace(/,/g, '')) || 0 : 0);

        const translationGL = calculateTranslationGainLoss(foreignBal, endingRate, bookRate);
        const totalGL = translationGL + transactionGL;

        rows.push({
          record_month: uploadMonth,
          bank_name: ALLOWED_BANKS.includes(bank) ? bank : '신한은행',
          account_number: accountNum,
          currency: ['USD', 'EUR', 'JPY'].includes(curr) ? curr : 'USD',
          foreign_balance: foreignBal,
          book_rate: bookRate,
          ending_rate: endingRate,
          transaction_gain_loss: transactionGL,
          translation_gain_loss: translationGL,
          total_gain_loss: totalGL,
          uploaded_by: userEmail,
        });
      }

      setCsvPreview(rows);
      setStatusMessage({
        type: 'success',
        text: `CSV 파일에서 ${rows.length}건의 계좌 데이터를 성공적으로 파싱했습니다.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `CSV 파싱 실패: ${err.message}` });
    }
  };

  // Save parsed CSV rows into Supabase (accumulative insert)
  const handleSaveCsvToSupabase = async () => {
    if (csvPreview.length === 0) return;
    setUploading(true);
    setStatusMessage(null);

    try {
      if (isConfigured && supabase) {
        // Supabase v2 bulk insert
        const { data, error } = await supabase.from('fx_records').insert(csvPreview).select();

        if (error) throw error;

        setStatusMessage({
          type: 'success',
          text: `Supabase DB에 ${csvPreview.length}건의 데이터가 성공적으로 누적 저장되었습니다!`,
        });
      } else {
        // Demo mode fallback
        const existing = [...dbRecords];
        const newItems = csvPreview.map((item, idx) => ({
          ...item,
          id: `demo-csv-${Date.now()}-${idx}`,
          created_at: new Date().toISOString(),
        }));
        const updated = [...newItems, ...existing];
        setDbRecords(updated);
        localStorage.setItem('lx_mma_supabase_demo_records', JSON.stringify(updated));

        setStatusMessage({
          type: 'success',
          text: `[데모 모드] ${csvPreview.length}건의 데이터가 누적 저장되었습니다. (Supabase 연결 시 실시간 반영)`,
        });
      }

      setCsvPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await fetchAccumulatedRecords();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Supabase 저장 실패: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  // One-click save current active dashboard data to Supabase
  const handleSaveCurrentDashboardData = async () => {
    setUploading(true);
    setStatusMessage(null);

    const validAccounts = currentAccounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));
    const recordsToInsert: FxDbRecord[] = validAccounts.map((acc) => {
      const transGL = calculateTranslationGainLoss(acc.foreignBalance, acc.endingRate, acc.bookRate);
      return {
        record_month: selectedMonth,
        bank_name: acc.bankName,
        account_number: acc.accountNumber,
        currency: acc.currency,
        foreign_balance: acc.foreignBalance,
        book_rate: acc.bookRate,
        ending_rate: acc.endingRate,
        transaction_gain_loss: acc.transactionGainLoss,
        translation_gain_loss: transGL,
        total_gain_loss: transGL + acc.transactionGainLoss,
        uploaded_by: userEmail,
      };
    });

    try {
      if (isConfigured && supabase) {
        const { error } = await supabase.from('fx_records').insert(recordsToInsert);
        if (error) throw error;

        setStatusMessage({
          type: 'success',
          text: `현재 대시보드 ${validAccounts.length}개 계좌 데이터가 [${selectedMonth}] 기준으로 Supabase에 성공적으로 누적되었습니다.`,
        });
      } else {
        const existing = [...dbRecords];
        const newItems = recordsToInsert.map((item, idx) => ({
          ...item,
          id: `demo-curr-${Date.now()}-${idx}`,
          created_at: new Date().toISOString(),
        }));
        const updated = [...newItems, ...existing];
        setDbRecords(updated);
        localStorage.setItem('lx_mma_supabase_demo_records', JSON.stringify(updated));

        setStatusMessage({
          type: 'success',
          text: `[데모 모드] 현재 데이터 ${validAccounts.length}건이 [${selectedMonth}] 기준으로 누적 저장되었습니다.`,
        });
      }

      await fetchAccumulatedRecords();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `저장 실패: ${err.message}` });
    } finally {
      setUploading(false);
    }
  };

  // Delete single record
  const handleDeleteRecord = async (id?: string) => {
    if (!id) return;
    if (!window.confirm('선택한 누적 레코드를 삭제하시겠습니까?')) return;

    try {
      if (isConfigured && supabase) {
        const { error } = await supabase.from('fx_records').delete().eq('id', id);
        if (error) throw error;
      } else {
        const updated = dbRecords.filter((r) => r.id !== id);
        setDbRecords(updated);
        localStorage.setItem('lx_mma_supabase_demo_records', JSON.stringify(updated));
      }
      setDbRecords((prev) => prev.filter((r) => r.id !== id));
      setStatusMessage({ type: 'success', text: '레코드가 삭제되었습니다.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `삭제 실패: ${err.message}` });
    }
  };

  // Filter dbRecords
  const filteredRecords = dbRecords.filter((rec) => {
    const matchMonth = filterMonth === 'ALL' || rec.record_month === filterMonth;
    const matchBank = filterBank === 'ALL' || rec.bank_name === filterBank;
    return matchMonth && matchBank;
  });

  const uniqueMonths = Array.from(new Set(dbRecords.map((r) => r.record_month))).filter(Boolean);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Load selected historical records into current dashboard
  const handleLoadMonthToDashboard = (month: string) => {
    const monthRecords = dbRecords.filter((r) => r.record_month === month);
    if (monthRecords.length === 0) return;

    if (
      window.confirm(
        `[${month}]의 누적 데이터(${monthRecords.length}건)를 현재 메인 대시보드로 불러오시겠습니까?`
      )
    ) {
      const convertedAccounts: FxAccount[] = monthRecords.map((r, i) => ({
        id: r.id || `acc-loaded-${i}`,
        bankName: r.bank_name,
        accountNumber: r.account_number,
        currency: r.currency as Currency,
        foreignBalance: Number(r.foreign_balance),
        bookRate: Number(r.book_rate),
        endingRate: Number(r.ending_rate),
        avgRate: (Number(r.book_rate) + Number(r.ending_rate)) / 2,
        transactionGainLoss: Number(r.transaction_gain_loss),
      }));

      if (onApplyHistoricalDataToDashboard) {
        onApplyHistoricalDataToDashboard(convertedAccounts, month);
      }
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Top Banner: Supabase Connection Info */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
              <Database className="w-3.5 h-3.5 text-sky-600" />
              <span>Supabase 데이터베이스 연동</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 ${
                isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isConfigured ? '클라우드 DB 활성화' : '데모 모드 (환경변수 설정 대기)'}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            외화 손익 데이터 Supabase 누적 아카이브
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
            신한·우리·하나·국민·신한(독일) 외화 계좌의 월별 평가 및 실현 손익 내역을 안전하게 클라우드 DB에 시계열로 축적합니다.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
          >
            <Database className="w-3.5 h-3.5 text-sky-600" />
            <span>SQL 스크립트</span>
          </button>
          <button
            type="button"
            onClick={handleSaveCurrentDashboardData}
            disabled={uploading}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shadow-xs disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowDownToLine className="w-3.5 h-3.5 text-sky-400" />
            )}
            <span>현재 대시보드 데이터 즉시 누적</span>
          </button>
        </div>
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : 'bg-red-50/80 border-red-200 text-red-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Two Column Section: CSV Upload Box & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CSV Upload Container (2 cols on lg) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">CSV 파일 업로드 및 누적 저장</h3>
            </div>
            {/* Target Month Select */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-slate-500 font-medium">기준 월:</span>
              <input
                type="text"
                value={uploadMonth}
                onChange={(e) => setUploadMonth(e.target.value)}
                placeholder="예: 2026년 8월"
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 w-36 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-xl p-6 text-center cursor-pointer transition bg-slate-50/40 hover:bg-sky-50/20"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">
              외화 계좌 CSV 파일을 클릭하거나 여기로 드래그하세요
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              형식: 은행명, 계좌번호, 통화(USD/EUR/JPY), 외화잔액, 장부지가, 기말환율, 환차손익
            </p>
          </div>

          {/* CSV Preview Table if rows exist */}
          {csvPreview.length > 0 && (
            <div className="mt-5 border border-slate-200/80 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  업로드 대기 목록 ({csvPreview.length}건 파싱 완료)
                </span>
                <button
                  type="button"
                  onClick={handleSaveCsvToSupabase}
                  disabled={uploading}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Supabase에 누적 저장</span>
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/60 text-slate-500 font-semibold border-b border-slate-100 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">은행</th>
                      <th className="py-2 px-3">통화</th>
                      <th className="py-2 px-3 text-right">외화잔액</th>
                      <th className="py-2 px-3 text-right">기말환율</th>
                      <th className="py-2 px-3 text-right">외화환산손익</th>
                      <th className="py-2 px-3 text-right">환차손익</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {csvPreview.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/70">
                        <td className="py-2 px-3 font-sans font-medium text-slate-800">{item.bank_name}</td>
                        <td className="py-2 px-3 font-sans">
                          <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                            {item.currency}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-slate-900">{formatForeign(item.foreign_balance, item.currency)}</td>
                        <td className="py-2 px-3 text-right text-slate-600">{item.ending_rate.toFixed(2)}</td>
                        <td
                          className={`py-2 px-3 text-right ${
                            item.translation_gain_loss < 0 ? 'text-red-500 font-semibold' : 'text-slate-900 font-medium'
                          }`}
                        >
                          {formatKRW(item.translation_gain_loss)}
                        </td>
                        <td
                          className={`py-2 px-3 text-right ${
                            item.transaction_gain_loss < 0 ? 'text-red-500 font-semibold' : 'text-slate-900 font-medium'
                          }`}
                        >
                          {formatKRW(item.transaction_gain_loss)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Database Accumulation Overview Card */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100 mb-4">
              <History className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">누적 저장 아카이브 요약</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">총 누적 레코드</span>
                <span className="text-sm font-bold font-mono text-slate-900">{dbRecords.length} 건</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">누적 월차 수</span>
                <span className="text-sm font-bold font-mono text-slate-900">{uniqueMonths.length} 개월</span>
              </div>
              <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">최근 저장 사용자</span>
                <span className="text-xs font-medium text-slate-700 truncate max-w-[150px]">
                  {userEmail || 'finance.admin'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-[11px] text-slate-400">
            데이터는 Supabase PostgreSQL의 <code>fx_records</code> 테이블에 누적 보관되며 RLS로 인가된 계정만 조회 가능합니다.
          </div>
        </div>

      </div>

      {/* Historical Data Viewer & Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Supabase 누적 이력 조회 ({filteredRecords.length}건)</h3>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            {/* Filter by Month */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">전체 기준월</option>
              {uniqueMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            {/* Filter by Bank */}
            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">전체 은행</option>
              {ALLOWED_BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>

            {/* Refresh */}
            <button
              onClick={fetchAccumulatedRecords}
              disabled={loadingHistory}
              className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition"
              title="새로고침"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">기준월 / 저장일시</th>
                <th className="py-3 px-4">은행 / 계좌번호</th>
                <th className="py-3 px-4">통화</th>
                <th className="py-3 px-4 text-right">외화 잔액</th>
                <th className="py-3 px-4 text-right">기말환율</th>
                <th className="py-3 px-4 text-right">외화환산손익 (평가)</th>
                <th className="py-3 px-4 text-right">환차손익 (실현)</th>
                <th className="py-3 px-4 text-right">손익 합계</th>
                <th className="py-3 px-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-sans">
                    누적된 기록이 없습니다. CSV를 업로드하거나 상단의 [현재 대시보드 데이터 즉시 누적]을 클릭해 보세요.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const totalGL = Number(rec.total_gain_loss || 0);
                  const translationGL = Number(rec.translation_gain_loss || 0);
                  const transactionGL = Number(rec.transaction_gain_loss || 0);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-800">{rec.record_month}</div>
                        <div className="text-[10px] text-slate-400">
                          {rec.created_at ? new Date(rec.created_at).toLocaleDateString('ko-KR') : '-'}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <div className="font-semibold text-slate-800">{rec.bank_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{rec.account_number}</div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                          {rec.currency}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-900 font-medium">
                        {formatForeign(Number(rec.foreign_balance), rec.currency as Currency)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {Number(rec.ending_rate).toFixed(2)} 원
                      </td>
                      
                      {/* Negative = red and ▲, Positive = black with no sign */}
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          translationGL < 0 ? 'text-red-500 font-semibold' : 'text-slate-900'
                        }`}
                      >
                        {formatKRW(translationGL)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-medium ${
                          transactionGL < 0 ? 'text-red-500 font-semibold' : 'text-slate-900'
                        }`}
                      >
                        {formatKRW(transactionGL)}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-bold ${
                          totalGL < 0 ? 'text-red-500 bg-red-50/40' : 'text-slate-900 bg-slate-50/50'
                        }`}
                      >
                        {formatKRW(totalGL)}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <button
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition rounded"
                          title="레코드 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load Historical Month Action Bar */}
        {uniqueMonths.length > 0 && (
          <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              특정 월차의 누적 데이터를 현재 활성 대시보드로 동기화하여 불러오기:
            </span>
            <div className="flex items-center space-x-1.5 flex-wrap">
              {uniqueMonths.map((m) => (
                <button
                  key={m}
                  onClick={() => handleLoadMonthToDashboard(m)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition"
                >
                  {m} 불러오기
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SQL Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Supabase DB 스키마 & 보안 정책 SQL</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-xs"
              >
                닫기
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Supabase 대시보드의 <strong>SQL Editor</strong>에서 아래 쿼리를 실행해 주시면 테이블 생성, RLS 권한 부여 및 인덱스 생성이 완료됩니다:
              </p>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                  {SUPABASE_SETUP_SQL}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? '복사됨' : 'SQL 복사'}</span>
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                <strong>테이블 명세 (fx_records):</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 font-mono text-[10px] text-slate-700">
                  <li>id: UUID (기본키)</li>
                  <li>record_month: 기준월 (예: '2026년 8월')</li>
                  <li>bank_name: 은행명 (신한, 우리, 하나, 국민, 신한(독일))</li>
                  <li>foreign_balance, book_rate, ending_rate: 잔액 및 환율 정보</li>
                  <li>translation_gain_loss, transaction_gain_loss: 평가 및 실현 손익</li>
                  <li>uploaded_by: 업로드 담당자 이메일</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
