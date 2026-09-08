export type Currency = 'USD' | 'EUR' | 'JPY' | 'CNY' | 'GBP';

export interface FxAccount {
  id: string;
  bankName: string;      // 은행명 (예: 신한은행, 우리은행, 하나은행 등)
  accountNumber: string; // 계좌번호 (마스킹 처리)
  currency: Currency;    // 통화
  foreignBalance: number;// 외화 잔액
  bookRate: number;      // 장부지가 (평균 장부환율)
  endingRate: number;    // 기말환율 (당월말 기준환율)
  avgRate: number;       // 당월 평균환율 (결제/환전 시 적용)
  transactionGainLoss: number; // 환차손익 (원화) - 실현손익
  notes?: string;        // 비고 (옵션)
}

export interface MonthlyTrendData {
  month: string;         // '1월', '2월', ...
  translationGainLoss: number; // 외화환산손익 (백만 원)
  transactionGainLoss: number; // 환차손익 (백만 원)
  totalUsdBalance: number;     // USD 환산 총잔액 (백만 불)
}

export interface CurrencySummary {
  currency: Currency;
  totalForeign: number;
  usdEquivalent: number;
  translationGainLoss: number;
  transactionGainLoss: number;
}

export interface BankSummary {
  bankName: string;
  accountCount: number;
  usdEquivalent: number;
  translationGainLoss: number;
  transactionGainLoss: number;
}
