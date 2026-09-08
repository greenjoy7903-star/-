import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { FxAccount } from '../types';
import { calculateTranslationGainLoss, formatKRW } from '../utils/formatters';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface SummaryCardsProps {
  accounts: FxAccount[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ accounts }) => {
  const validAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));
  let totalUsdValuation = 0;
  let totalTranslationGL = 0;
  let totalTransactionGL = 0;

  validAccounts.forEach((acc) => {
    const transGL = calculateTranslationGainLoss(acc.foreignBalance, acc.endingRate, acc.bookRate);
    totalTranslationGL += transGL;
    totalTransactionGL += acc.transactionGainLoss;

    if (acc.currency === 'USD') {
      totalUsdValuation += acc.foreignBalance;
    } else if (acc.currency === 'EUR') {
      totalUsdValuation += acc.foreignBalance * 1.08;
    } else if (acc.currency === 'JPY') {
      totalUsdValuation += acc.foreignBalance / 150;
    }
  });

  const netTotalGL = totalTranslationGL + totalTransactionGL;

  const cards = [
    {
      title: '외화예금 총액',
      subTitle: 'USD 환산 잔액',
      rawValue: totalUsdValuation,
      displayValue: `$${(totalUsdValuation / 1000000).toFixed(2)}M`,
      subText: `약 ${(totalUsdValuation * 1368.2 / 100000000).toFixed(1)}억원 상당`,
      isNegative: false,
      icon: Wallet,
      badge: '자산 총액',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-100',
    },
    {
      title: '외화환산손익',
      subTitle: '기말 평가손익',
      rawValue: totalTranslationGL,
      displayValue: formatKRW(totalTranslationGL),
      subText: totalTranslationGL >= 0 ? '환율 상승 효과' : '환율 하락 영향',
      isNegative: totalTranslationGL < 0,
      icon: totalTranslationGL >= 0 ? TrendingUp : TrendingDown,
      badge: '평가 손익',
      badgeColor: totalTranslationGL < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    {
      title: '외환차손익',
      subTitle: '결제 실현손익',
      rawValue: totalTransactionGL,
      displayValue: formatKRW(totalTransactionGL),
      subText: '수출입 결제 누적',
      isNegative: totalTransactionGL < 0,
      icon: totalTransactionGL >= 0 ? TrendingUp : TrendingDown,
      badge: '실현 손익',
      badgeColor: totalTransactionGL < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    {
      title: '당월 순손익 합계',
      subTitle: '평가 + 실현 손익',
      rawValue: netTotalGL,
      displayValue: formatKRW(netTotalGL),
      subText: netTotalGL >= 0 ? '영업외수익 반영' : '영업외비용 반영',
      isNegative: netTotalGL < 0,
      icon: DollarSign,
      badge: '전사 환효과',
      badgeColor: netTotalGL < 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-violet-50 text-violet-700 border-violet-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {card.title}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              <div className="mt-3">
                {/* 음수일 경우 ▲ 표시 및 빨간색 처리 */}
                <div
                  className={`text-2xl font-bold tracking-tight font-mono ${
                    card.isNegative ? 'text-red-500' : 'text-slate-900'
                  }`}
                >
                  {card.displayValue}
                </div>
                <div className="text-xs text-slate-400 mt-1 font-medium">
                  {card.subTitle} • {card.subText}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{card.isNegative ? '손실 반영' : '안정적 관리'}</span>
              <Icon className={`w-4 h-4 ${card.isNegative ? 'text-red-500' : 'text-slate-400'}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
