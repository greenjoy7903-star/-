import React, { useState } from 'react';
import { FxAccount, Currency } from '../types';
import { formatKRW, formatForeign } from '../utils/formatters';
import { FileSpreadsheet, CheckCircle2, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface CurrencyDetailViewProps {
  accounts: FxAccount[];
  onUpdateAccountRate: (currency: Currency, newEndingRate: number) => void;
}

export const CurrencyDetailView: React.FC<CurrencyDetailViewProps> = ({ accounts, onUpdateAccountRate }) => {
  const defaultRates: Record<Currency, number> = {
    USD: 1368.20,
    EUR: 1489.50,
    JPY: 8.94,
    CNY: 190.20,
    GBP: 1750.00,
  };

  const [marketRates, setMarketRates] = useState<Record<Currency, number>>(defaultRates);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [chartMode, setChartMode] = useState<'index' | 'absolute'>('index');

  const currencies: Currency[] = ['USD', 'EUR', 'JPY'];

  const validAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));

  // 월별 매매기준환율 히스토리 (USD, EUR, JPY)
  const rawMonthlyHistory = [
    { month: '1월', USD: 1330.50, EUR: 1440.00, JPY: 8.75 },
    { month: '2월', USD: 1342.10, EUR: 1455.20, JPY: 8.82 },
    { month: '3월', USD: 1335.80, EUR: 1450.10, JPY: 8.78 },
    { month: '4월', USD: 1360.20, EUR: 1472.50, JPY: 8.85 },
    { month: '5월', USD: 1375.40, EUR: 1495.00, JPY: 8.95 },
    { month: '6월', USD: 1362.00, EUR: 1482.30, JPY: 8.90 },
    { month: '7월', USD: 1355.10, EUR: 1478.00, JPY: 8.88 },
    { month: '8월', USD: 1368.20, EUR: 1489.50, JPY: 8.94 },
  ];

  const baseUSD = rawMonthlyHistory[0].USD;
  const baseEUR = rawMonthlyHistory[0].EUR;
  const baseJPY = rawMonthlyHistory[0].JPY;

  const indexedMonthlyHistory = rawMonthlyHistory.map((item) => ({
    month: item.month,
    USD: Number(((item.USD / baseUSD) * 100).toFixed(2)),
    EUR: Number(((item.EUR / baseEUR) * 100).toFixed(2)),
    JPY: Number(((item.JPY / baseJPY) * 100).toFixed(2)),
    rawUSD: item.USD,
    rawEUR: item.EUR,
    rawJPY: item.JPY,
  }));

  const handleRateChange = (currency: Currency, rate: number) => {
    setMarketRates((prev) => ({ ...prev, [currency]: rate }));
    onUpdateAccountRate(currency, rate);
    setSuccessMessage(`${currency} 환율(${rate.toLocaleString()}) 반영 완료`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const currencySummaryData = currencies.map((curr) => {
    const currAccounts = validAccounts.filter((a) => a.currency === curr);
    const totalForeign = currAccounts.reduce((sum, a) => sum + a.foreignBalance, 0);

    let translationGain = 0;
    let translationLoss = 0;
    let transactionGain = 0;
    let transactionLoss = 0;

    currAccounts.forEach((acc) => {
      const currentEndingRate = marketRates[curr] || acc.endingRate;
      const transGL = (currentEndingRate - acc.bookRate) * acc.foreignBalance;

      if (transGL >= 0) {
        translationGain += transGL;
      } else {
        translationLoss += Math.abs(transGL);
      }

      if (acc.transactionGainLoss >= 0) {
        transactionGain += acc.transactionGainLoss;
      } else {
        transactionLoss += Math.abs(acc.transactionGainLoss);
      }
    });

    const netTranslation = translationGain - translationLoss;
    const netTransaction = transactionGain - transactionLoss;
    const netTotal = netTranslation + netTransaction;

    return {
      currency: curr,
      accountCount: currAccounts.length,
      totalForeign,
      endingRate: marketRates[curr],
      translationGain,
      translationLoss,
      netTranslation,
      transactionGain,
      transactionLoss,
      netTransaction,
      netTotal,
    };
  }).filter((item) => item.accountCount > 0 || item.totalForeign > 0);

  const grandTotal = currencySummaryData.reduce(
    (acc, item) => ({
      translationGain: acc.translationGain + item.translationGain,
      translationLoss: acc.translationLoss + item.translationLoss,
      transactionGain: acc.transactionGain + item.transactionGain,
      transactionLoss: acc.transactionLoss + item.transactionLoss,
      netTotal: acc.netTotal + item.netTotal,
    }),
    { translationGain: 0, translationLoss: 0, transactionGain: 0, transactionLoss: 0, netTotal: 0 }
  );

  return (
    <div className="space-y-6 mb-8">
      {/* Rate Input Section */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-600" />
              <span>통화별 환율 설정</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              기말 매매기준환율을 변경하면 손익이 즉시 재계산됩니다.
            </p>
          </div>
          {successMessage && (
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg border border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Currency Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {currencies.map((curr) => (
            <div key={curr} className="bg-slate-50/50 p-3.5 rounded-xl border border-slate-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700 text-xs">{curr} 기말환율</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200/60">
                  적용 환율
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={marketRates[curr]}
                  onChange={(e) => handleRateChange(curr, parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800"
                />
                <span className="text-xs text-slate-400">원</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">환율 트렌드 비교</h4>
              <p className="text-[11px] text-slate-400">2026년 월별 환율 추이 겹침 비교</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 bg-slate-100/70 p-1 rounded-lg border border-slate-200/50">
            <button
              onClick={() => setChartMode('index')}
              className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
                chartMode === 'index' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              지수화 (1월=100)
            </button>
            <button
              onClick={() => setChartMode('absolute')}
              className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
                chartMode === 'absolute' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              절대값 (원)
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={indexedMonthlyHistory} margin={{ top: 10, right: 25, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    color: '#0f172a',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  }}
                  formatter={(val: any, name: any, item: any) => {
                    const currName = name === 'USD' ? 'USD' : name === 'EUR' ? 'EUR' : 'JPY';
                    if (chartMode === 'index') {
                      const rawVal = item.payload[`raw${currName}`];
                      return [`지수 ${val} (${rawVal?.toLocaleString()}원)`, currName];
                    } else {
                      return [`${Number(val).toLocaleString()} 원`, currName];
                    }
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey={chartMode === 'index' ? 'USD' : 'rawUSD'} name="USD" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: '#38bdf8' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey={chartMode === 'index' ? 'EUR' : 'rawEUR'} name="EUR" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3, fill: '#34d399' }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey={chartMode === 'index' ? 'JPY' : 'rawJPY'} name="JPY" stroke="#a78bfa" strokeWidth={2.5} dot={{ r: 3, fill: '#a78bfa' }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
          <h4 className="font-bold text-slate-900 text-sm">통화별 손익 집계표</h4>
          <span className="text-xs text-slate-400 font-medium">(단위: 원화)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">통화</th>
                <th className="py-3 px-4 text-right">계좌수</th>
                <th className="py-3 px-4 text-right">외화 잔액</th>
                <th className="py-3 px-4 text-right">기말 환율</th>
                <th className="py-3 px-4 text-right">환산 이익</th>
                <th className="py-3 px-4 text-right">환산 손실</th>
                <th className="py-3 px-4 text-right">외환 차익</th>
                <th className="py-3 px-4 text-right">외환 차손</th>
                <th className="py-3 px-4 text-right font-bold text-slate-800">순손익</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {currencySummaryData.map((item) => (
                <tr key={item.currency} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-800 flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span>{item.currency}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans text-slate-500">{item.accountCount}개</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                    {formatForeign(item.totalForeign, item.currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-900">
                    {item.endingRate.toLocaleString('ko-KR', { minimumFractionDigits: 2 })} 원
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-900 font-medium">
                    {formatKRW(item.translationGain)}
                  </td>
                  {/* 손실 표기 시 음수/손실은 빨간색 및 ▲ 표기 적용 */}
                  <td className="py-3.5 px-4 text-right text-red-500 font-medium">
                    {item.translationLoss > 0 ? `▲ ${formatKRW(item.translationLoss).replace('+', '').replace('-', '').trim()}` : '0 원'}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-900 font-medium">
                    {formatKRW(item.transactionGain)}
                  </td>
                  <td className="py-3.5 px-4 text-right text-red-500 font-medium">
                    {item.transactionLoss > 0 ? `▲ ${formatKRW(item.transactionLoss).replace('+', '').replace('-', '').trim()}` : '0 원'}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-bold ${
                      item.netTotal < 0 ? 'text-red-500 bg-red-50/40' : 'text-slate-900 bg-slate-50/50'
                    }`}
                  >
                    {formatKRW(item.netTotal)}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Grand Total */}
            <tfoot>
              <tr className="bg-slate-50/80 font-bold text-slate-800 border-t border-slate-200/80 text-xs font-mono">
                <td className="py-3.5 px-4 font-sans" colSpan={4}>
                  전체 합계
                </td>
                <td className="py-3.5 px-4 text-right text-slate-900 font-bold">
                  {formatKRW(grandTotal.translationGain)}
                </td>
                <td className="py-3.5 px-4 text-right text-red-500">
                  {grandTotal.translationLoss > 0 ? `▲ ${formatKRW(grandTotal.translationLoss).replace('+', '').replace('-', '').trim()}` : '0 원'}
                </td>
                <td className="py-3.5 px-4 text-right text-slate-900 font-bold">
                  {formatKRW(grandTotal.transactionGain)}
                </td>
                <td className="py-3.5 px-4 text-right text-red-500">
                  {grandTotal.transactionLoss > 0 ? `▲ ${formatKRW(grandTotal.transactionLoss).replace('+', '').replace('-', '').trim()}` : '0 원'}
                </td>
                <td
                  className={`py-3.5 px-4 text-right text-sm ${
                    grandTotal.netTotal < 0 ? 'text-red-600 bg-red-100/50' : 'text-slate-900 bg-slate-100/60'
                  }`}
                >
                  {formatKRW(grandTotal.netTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
