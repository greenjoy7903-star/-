import React, { useState } from 'react';
import { FxAccount } from '../types';
import { formatKRW, formatForeign } from '../utils/formatters';
import { Sliders } from 'lucide-react';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface SimulationViewProps {
  accounts: FxAccount[];
}

export const SimulationView: React.FC<SimulationViewProps> = ({ accounts }) => {
  const [rateChangePercent, setRateChangePercent] = useState<number>(3.0);

  const validAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));

  let currentTotalTranslationGL = 0;
  let simulatedTotalTranslationGL = 0;

  const simulatedAccounts = validAccounts.map((acc) => {
    const origGL = (acc.endingRate - acc.bookRate) * acc.foreignBalance;
    currentTotalTranslationGL += origGL;

    const simulatedEndingRate = acc.endingRate * (1 + rateChangePercent / 100);
    const simGL = (simulatedEndingRate - acc.bookRate) * acc.foreignBalance;
    simulatedTotalTranslationGL += simGL;

    return {
      ...acc,
      simulatedEndingRate,
      origGL,
      simulatedGL: simGL,
      diffGL: simGL - origGL,
    };
  });

  const diffTotal = simulatedTotalTranslationGL - currentTotalTranslationGL;

  return (
    <div className="space-y-6 mb-8">
      {/* Simulation Header & Controls */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>환율 변동 시뮬레이션</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              환율 등락에 따른 외화환산손익 민감도 실시간 분석
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            {[-5, -3, -1, 1, 3, 5].map((pct) => (
              <button
                key={pct}
                onClick={() => setRateChangePercent(pct)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition border ${
                  rateChangePercent === pct
                    ? 'bg-slate-900 text-white border-slate-900'
                    : pct < 0
                    ? 'bg-white text-red-500 border-slate-200 hover:bg-red-50/50'
                    : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {pct < 0 ? `▲ ${Math.abs(pct)}%` : `${pct}%`}
              </button>
            ))}
          </div>
        </div>

        {/* Slider */}
        <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/70 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">기말환율 변동률 설정</span>
            <span
              className={`text-sm font-bold font-mono ${
                rateChangePercent < 0 ? 'text-red-500' : 'text-slate-900'
              }`}
            >
              {rateChangePercent < 0
                ? `▲ ${Math.abs(rateChangePercent).toFixed(1)}% 변동`
                : `${rateChangePercent.toFixed(1)}% 변동`}
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="10"
            step="0.5"
            value={rateChangePercent}
            onChange={(e) => setRateChangePercent(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
            <span className="text-red-400">▲ 10% (원화 강세)</span>
            <span>0% (기준)</span>
            <span className="text-slate-700">10% (원화 약세)</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium">현재 환산손익</span>
            <div
              className={`text-lg font-bold font-mono mt-1 ${
                currentTotalTranslationGL < 0 ? 'text-red-500' : 'text-slate-900'
              }`}
            >
              {formatKRW(currentTotalTranslationGL)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium">
              시뮬레이션 손익 (
              {rateChangePercent < 0 ? `▲ ${Math.abs(rateChangePercent)}%` : `${rateChangePercent}%`}
              )
            </span>
            <div
              className={`text-lg font-bold font-mono mt-1 ${
                simulatedTotalTranslationGL < 0 ? 'text-red-500' : 'text-slate-900'
              }`}
            >
              {formatKRW(simulatedTotalTranslationGL)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/70">
            <span className="text-[11px] text-slate-500 font-medium">손익 증감액 (Delta)</span>
            <div
              className={`text-lg font-bold font-mono mt-1 ${
                diffTotal < 0 ? 'text-red-500' : 'text-slate-900'
              }`}
            >
              {formatKRW(diffTotal)}
            </div>
          </div>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/40">
          <h4 className="font-bold text-slate-900 text-sm">계좌별 시뮬레이션 결과</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-4">은행</th>
                <th className="py-3 px-4">통화</th>
                <th className="py-3 px-4 text-right">외화 잔액</th>
                <th className="py-3 px-4 text-right">기존 환율</th>
                <th className="py-3 px-4 text-right">시뮬 환율</th>
                <th className="py-3 px-4 text-right">기존 손익</th>
                <th className="py-3 px-4 text-right">시뮬 손익</th>
                <th className="py-3 px-4 text-right">증감 (Delta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-mono">
              {simulatedAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-sans font-semibold text-slate-800">
                    {acc.bankName}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                      {acc.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">{formatForeign(acc.foreignBalance, acc.currency)}</td>
                  <td className="py-3 px-4 text-right text-slate-500">{acc.endingRate.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-slate-900 font-semibold">{acc.simulatedEndingRate.toFixed(2)}</td>
                  <td
                    className={`py-3 px-4 text-right ${
                      acc.origGL < 0 ? 'text-red-500 font-medium' : 'text-slate-900 font-medium'
                    }`}
                  >
                    {formatKRW(acc.origGL)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-medium ${
                      acc.simulatedGL < 0 ? 'text-red-500' : 'text-slate-900'
                    }`}
                  >
                    {formatKRW(acc.simulatedGL)}
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      acc.diffGL < 0 ? 'text-red-500 bg-red-50/40' : 'text-slate-900 bg-slate-50/50'
                    }`}
                  >
                    {formatKRW(acc.diffGL)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
