export function formatKRW(amount: number): string {
  const absVal = Math.abs(amount);
  // 음수만 - 를 ▲로 표시
  const sign = amount < 0 ? '▲ ' : '';
  
  if (absVal >= 100000000) {
    const eok = (absVal / 100000000).toFixed(2);
    return `${sign}${eok} 억원`;
  } else if (absVal >= 10000) {
    const man = (absVal / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 });
    return `${sign}${man} 만원`;
  } else {
    return `${sign}${absVal.toLocaleString('ko-KR')} 원`;
  }
}

export function formatKRWRaw(amount: number): string {
  if (amount < 0) {
    return `▲ ${Math.abs(amount).toLocaleString('ko-KR')} 원`;
  }
  return `${amount.toLocaleString('ko-KR')} 원`;
}

export function formatPercent(value: number): string {
  if (value < 0) {
    return `▲ ${Math.abs(value).toFixed(1)}%`;
  } else if (value > 0) {
    return `${value.toFixed(1)}%`;
  }
  return '0.0%';
}

export function formatForeign(amount: number, currency: string): string {
  const formatted = amount.toLocaleString('ko-KR', { maximumFractionDigits: 2 });
  switch (currency) {
    case 'USD': return `$${formatted}`;
    case 'EUR': return `€${formatted}`;
    case 'JPY': return `¥${formatted}`;
    case 'CNY': return `¥${formatted}`;
    case 'GBP': return `£${formatted}`;
    default: return `${formatted} ${currency}`;
  }
}

// 환산손익 계산식: (기말환율 - 장부지가) * 외화잔액
export function calculateTranslationGainLoss(foreignBalance: number, endingRate: number, bookRate: number): number {
  return Math.round((endingRate - bookRate) * foreignBalance);
}

// USD 환산액 계산 (USD, EUR, JPY 지원)
export function getUsdEquivalent(account: { currency: string; foreignBalance: number; endingRate: number }): number {
  if (account.currency === 'USD') {
    return account.foreignBalance;
  } else if (account.currency === 'EUR') {
    return Math.round(account.foreignBalance * (account.endingRate / 1368.20));
  } else if (account.currency === 'JPY') {
    return Math.round((account.foreignBalance * (account.endingRate / 1368.20)) / 100);
  }
  return account.foreignBalance;
}
