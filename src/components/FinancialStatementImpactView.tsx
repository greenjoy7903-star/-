import React from 'react';
import { FxAccount } from '../types';
import { calculateTranslationGainLoss, formatKRW, getUsdEquivalent } from '../utils/formatters';
import { FileText, Layers, CheckCircle } from 'lucide-react';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface FinancialStatementImpactViewProps {
  accounts: FxAccount[];
}

export const FinancialStatementImpactView: React.FC<FinancialStatementImpactViewProps> = ({ accounts }) => {
  const validAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));

  let totalTranslationGain = 0;
  let totalTranslationLoss = 0;
  let totalTransactionGain = 0;
  let totalTransactionLoss = 0;
  let totalForeignUsdEquiv = 0;

  validAccounts.forEach((acc) => {
    const transGL = calculateTranslationGainLoss(acc.foreignBalance, acc.endingRate, acc.bookRate);
    if (transGL >= 0) {
      totalTranslationGain += transGL;
    } else {
      totalTranslationLoss += Math.abs(transGL);
    }

    if (acc.transactionGainLoss >= 0) {
      totalTransactionGain += acc.transactionGainLoss;
    } else {
      totalTransactionLoss += Math.abs(acc.transactionGainLoss);
    }

    totalForeignUsdEquiv += getUsdEquivalent(acc);
  });

  const netTranslationGL = totalTranslationGain - totalTranslationLoss;
  const netTransactionGL = totalTransactionGain - totalTransactionLoss;
  const totalFxNetEffect = netTranslationGL + netTransactionGL;

  return (
    <div className="space-y-6 mb-8">
      {/* Designer Clean Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
        <div className="flex items-center space-x-2 bg-sky-50 border border-sky-100 px-3 py-1 rounded-full w-fit mb-2 text-xs font-semibold text-sky-700">
          <FileText className="w-3.5 h-3.5 text-sky-600" />
          <span>K-IFRS 회계기준 재무제표 영향 분석</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
          (주) LX MMA 재무제표(B/S 및 I/S) 환효과 영향
        </h3>
        <p className="text-slate-500 text-xs leading-relaxed max-w-3xl">
          기말환율 변동이 회사의 <strong>재무상태표(Balance Sheet)</strong> 자산 평가액 및 <strong>손익계산서(Income Statement)</strong> 영업외손익에 미치는 영향을 직관적으로 분석합니다.
        </p>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500">재무상태표(B/S) 영향</span>
          <div className="text-xl font-bold text-slate-900 mt-2 font-mono">
            ${(totalForeignUsdEquiv / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-400">(외화예금 자산)</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">기말환율 적용 외화자산 원화 환산액 변동</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500">손익계산서(I/S) 손익 영향</span>
          <div className={`text-xl font-bold mt-2 font-mono ${totalFxNetEffect < 0 ? 'text-red-500' : 'text-slate-900'}`}>
            {formatKRW(totalFxNetEffect)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">환산손익(평가) + 환차손익(실현) 합계</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <span className="text-xs font-semibold text-slate-500">세전순이익(EBT) 기여도</span>
          <div className={`text-xl font-bold mt-2 ${totalFxNetEffect < 0 ? 'text-red-500' : 'text-slate-900'}`}>
            {totalFxNetEffect >= 0 ? '이익 순증가' : '▲ 비용 순증가'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">법인세차감전순이익 직접 반영</p>
        </div>
      </div>

      {/* Mapping Table */}
      <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/40">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>재무제표 계정과목별 환효과 매핑</span>
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            K-IFRS 제1021호(외환환율변동효과) 계정과목 분류 및 재무제표 반영 위치
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100">
                <th className="py-3 px-5">구분</th>
                <th className="py-3 px-5">계정과목</th>
                <th className="py-3 px-5">회계처리 성격</th>
                <th className="py-3 px-5 text-right">당월 금액</th>
                <th className="py-3 px-5">손익 영향 해석</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {/* Row 1: B/S */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium">
                    재무상태표 (B/S)
                  </span>
                </td>
                <td className="py-3.5 px-5 font-medium text-slate-800">
                  현금및현금성자산 (외화예금)
                </td>
                <td className="py-3.5 px-5 text-slate-500">
                  기말 매매기준환율로 재작성되어 자산 장부금액 변동
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-medium text-slate-900">
                  ${(totalForeignUsdEquiv / 1000000).toFixed(2)}M
                </td>
                <td className="py-3.5 px-5 text-slate-600">
                  원화 약세 시 외화예금의 원화 평가액 증가로 유동자산 확대
                </td>
              </tr>

              {/* Row 2: I/S Translation Gain */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[11px] font-medium border border-emerald-100">
                    손익계산서 (I/S)
                  </span>
                </td>
                <td className="py-3.5 px-5 font-medium text-slate-800">
                  외화환산이익 (영업외수익)
                </td>
                <td className="py-3.5 px-5 text-slate-500">
                  기말환율 &gt; 장부지가 계좌의 미실현 평가이익
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-medium text-slate-900">
                  {formatKRW(totalTranslationGain)}
                </td>
                <td className="py-3.5 px-5 text-slate-600">
                  장부상 평가이익으로 세전순이익(EBT) 증가에 기여
                </td>
              </tr>

              {/* Row 3: I/S Translation Loss */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[11px] font-medium border border-red-100">
                    손익계산서 (I/S)
                  </span>
                </td>
                <td className="py-3.5 px-5 font-medium text-red-500">
                  외화환산손실 (영업외비용)
                </td>
                <td className="py-3.5 px-5 text-slate-500">
                  기말환율 &lt; 장부지가 계좌의 미실현 평가손실
                </td>
                {/* 음수/손실 표기 시 ▲ 표기 및 빨간색 */}
                <td className="py-3.5 px-5 text-right font-mono font-bold text-red-500">
                  {totalTranslationLoss > 0 ? `▲ ${formatKRW(totalTranslationLoss).replace('+', '').replace('-', '').trim()}` : '0 원'}
                </td>
                <td className="py-3.5 px-5 text-slate-600">
                  원화 강세 시 외화자산 가치 하락으로 영업외비용 발생
                </td>
              </tr>

              {/* Row 4: I/S Transaction Gain */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[11px] font-medium border border-indigo-100">
                    손익계산서 (I/S)
                  </span>
                </td>
                <td className="py-3.5 px-5 font-medium text-slate-800">
                  외환차익 (영업외수익)
                </td>
                <td className="py-3.5 px-5 text-slate-500">
                  원자재 결제/수출 대금 입금 시 실제 실현된 이익
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-medium text-slate-900">
                  {formatKRW(totalTransactionGain)}
                </td>
                <td className="py-3.5 px-5 text-slate-600">
                  실제 현금 유입과 연동되는 실현 수익
                </td>
              </tr>

              {/* Row 5: I/S Transaction Loss */}
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-slate-800">
                  <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[11px] font-medium border border-red-100">
                    손익계산서 (I/S)
                  </span>
                </td>
                <td className="py-3.5 px-5 font-medium text-red-500">
                  외환차손 (영업외비용)
                </td>
                <td className="py-3.5 px-5 text-slate-500">
                  결제 시점 불리한 환율 적용에 따른 실제 실현 손실
                </td>
                {/* 음수/손실 표기 시 ▲ 표기 및 빨간색 */}
                <td className="py-3.5 px-5 text-right font-mono font-bold text-red-500">
                  {totalTransactionLoss > 0 ? `▲ ${formatKRW(totalTransactionLoss).replace('+', '').replace('-', '').trim()}` : '0 원'}
                </td>
                <td className="py-3.5 px-5 text-slate-600">
                  자금 결제 시 실질적인 현금 비용 증가 요인
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory Note */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-semibold text-slate-900 text-xs">자금담당 실무 가이드</h5>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
            LX MMA는 석유화학 원자재(MMA, MAA 등) 결제 비중이 높아 환율 변동이 세전순이익에 직접적인 영향을 미칩니다. 정기적인 기말 평가손익 및 실현손익 점검과 결제일 분산 전략이 권장됩니다.
          </p>
        </div>
      </div>
    </div>
  );
};
