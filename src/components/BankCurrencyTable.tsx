import React, { useState } from 'react';
import { FxAccount, Currency } from '../types';
import { calculateTranslationGainLoss, formatForeign, formatKRW } from '../utils/formatters';
import { Building2, Search, Edit3, Trash2, Plus } from 'lucide-react';

export const ALLOWED_BANKS = ['신한은행', '우리은행', '하나은행', '국민은행', '신한은행(독일)'];

interface BankCurrencyTableProps {
  accounts: FxAccount[];
  onEditAccount: (account: FxAccount) => void;
  onDeleteAccount: (id: string) => void;
  onOpenAddModal: () => void;
}

export const BankCurrencyTable: React.FC<BankCurrencyTableProps> = ({
  accounts,
  onEditAccount,
  onDeleteAccount,
  onOpenAddModal,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currencies: Currency[] = ['USD', 'EUR', 'JPY'];

  // 신한은행, 우리은행, 하나은행, 국민은행, 신한은행(독일) 계좌만 필터링
  const validBankAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));

  const filteredAccounts = validBankAccounts.filter((acc) => {
    const matchesBank = selectedBank === 'ALL' || acc.bankName === selectedBank;
    const matchesCurrency = selectedCurrency === 'ALL' || acc.currency === selectedCurrency;
    const matchesSearch =
      acc.accountNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.bankName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBank && matchesCurrency && matchesSearch;
  });

  // 합계 계산
  const totalTranslationGLSum = filteredAccounts.reduce((acc, curr) => {
    return acc + calculateTranslationGainLoss(curr.foreignBalance, curr.endingRate, curr.bookRate);
  }, 0);
  const totalTransactionGLSum = filteredAccounts.reduce((acc, curr) => acc + curr.transactionGainLoss, 0);
  const netTotalGLSum = totalTranslationGLSum + totalTransactionGLSum;

  return (
    <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden mb-8">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-50/40">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>외화 계좌 및 손익 현황</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            은행별 외화 잔액 및 기말 평가·실현 손익 명세
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="계좌번호 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 w-40 text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Bank Filter */}
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
          >
            <option value="ALL">전체 은행</option>
            {ALLOWED_BANKS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Currency Filter */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
          >
            <option value="ALL">전체 통화</option>
            {currencies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100">
              <th className="py-3 px-4">은행 / 계좌번호</th>
              <th className="py-3 px-4">통화</th>
              <th className="py-3 px-4 text-right">외화 잔액</th>
              <th className="py-3 px-4 text-right">장부지가</th>
              <th className="py-3 px-4 text-right">기말환율</th>
              <th className="py-3 px-4 text-right">외화환산손익 (평가)</th>
              <th className="py-3 px-4 text-right">환차손익 (실현)</th>
              <th className="py-3 px-4 text-right">손익 합계</th>
              <th className="py-3 px-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredAccounts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  조회된 계좌가 없습니다.
                </td>
              </tr>
            ) : (
              filteredAccounts.map((acc) => {
                const translationGL = calculateTranslationGainLoss(
                  acc.foreignBalance,
                  acc.endingRate,
                  acc.bookRate
                );
                const totalGL = translationGL + acc.transactionGainLoss;

                return (
                  <tr key={acc.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{acc.bankName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{acc.accountNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                        {acc.currency}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      {formatForeign(acc.foreignBalance, acc.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                      {acc.bookRate.toLocaleString('ko-KR', { minimumFractionDigits: 2 })} 원
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                      {acc.endingRate.toLocaleString('ko-KR', { minimumFractionDigits: 2 })} 원
                    </td>
                    
                    {/* 음수일 경우 ▲ 표시 및 빨간색, 양수는 부호 없이 검정색 */}
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-medium ${
                        translationGL < 0 ? 'text-red-500 font-semibold' : 'text-slate-900'
                      }`}
                    >
                      {formatKRW(translationGL)}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-medium ${
                        acc.transactionGainLoss < 0 ? 'text-red-500 font-semibold' : 'text-slate-900'
                      }`}
                    >
                      {formatKRW(acc.transactionGainLoss)}
                    </td>

                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        totalGL < 0 ? 'text-red-500 bg-red-50/40' : 'text-slate-900 bg-slate-50/50'
                      }`}
                    >
                      {formatKRW(totalGL)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => onEditAccount(acc)}
                          className="p-1 text-slate-400 hover:text-slate-700 transition rounded"
                          title="수정"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteAccount(acc.id)}
                          className="p-1 text-slate-400 hover:text-red-500 transition rounded"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer */}
          {filteredAccounts.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50/80 font-semibold text-slate-800 border-t border-slate-200/80 text-xs">
                <td className="py-3.5 px-4" colSpan={5}>
                  합계 ({filteredAccounts.length}개 계좌)
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-mono ${
                    totalTranslationGLSum < 0 ? 'text-red-500 font-bold' : 'text-slate-900 font-bold'
                  }`}
                >
                  {formatKRW(totalTranslationGLSum)}
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-mono ${
                    totalTransactionGLSum < 0 ? 'text-red-500 font-bold' : 'text-slate-900 font-bold'
                  }`}
                >
                  {formatKRW(totalTransactionGLSum)}
                </td>
                <td
                  className={`py-3.5 px-4 text-right font-mono font-bold ${
                    netTotalGLSum < 0 ? 'text-red-600 bg-red-100/50' : 'text-slate-900 bg-slate-100/60'
                  }`}
                >
                  {formatKRW(netTotalGLSum)}
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={onOpenAddModal}
                    className="inline-flex items-center space-x-1 text-xs text-sky-600 hover:text-sky-700 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>등록</span>
                  </button>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};
