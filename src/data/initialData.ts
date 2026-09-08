import { FxAccount, MonthlyTrendData } from '../types';

export const INITIAL_FX_ACCOUNTS: FxAccount[] = [
  {
    id: 'acc-1',
    bankName: '신한은행',
    accountNumber: '110-345-******',
    currency: 'USD',
    foreignBalance: 15500000, // 1,550만 불
    bookRate: 1355.50,
    endingRate: 1368.20,
    avgRate: 1360.10,
    transactionGainLoss: 12500000, // 1,250만원 이익
  },
  {
    id: 'acc-2',
    bankName: '우리은행',
    accountNumber: '100-281-******',
    currency: 'USD',
    foreignBalance: 12000000, // 1,200만 불
    bookRate: 1358.00,
    endingRate: 1368.20,
    avgRate: 1362.50,
    transactionGainLoss: -8200000, // 820만원 손실
  },
  {
    id: 'acc-3',
    bankName: '하나은행',
    accountNumber: '284-910-******',
    currency: 'EUR',
    foreignBalance: 4500000, // 450만 유로
    bookRate: 1475.20,
    endingRate: 1489.50,
    avgRate: 1480.00,
    transactionGainLoss: 15400000, // 1,540만원 이익
  },
  {
    id: 'acc-4',
    bankName: '국민은행',
    accountNumber: '812-02-******',
    currency: 'JPY',
    foreignBalance: 320000000, // 3.2억 엔
    bookRate: 8.85,
    endingRate: 8.94,
    avgRate: 8.90,
    transactionGainLoss: 5600000, // 560만원 이익
  },
  {
    id: 'acc-5',
    bankName: '신한은행(독일)',
    accountNumber: 'DE89-3704-******',
    currency: 'EUR',
    foreignBalance: 6500000, // 650만 유로
    bookRate: 1482.00,
    endingRate: 1489.50,
    avgRate: 1485.00,
    transactionGainLoss: 18200000, // 1,820만원 이익
  },
  {
    id: 'acc-6',
    bankName: '우리은행',
    accountNumber: '102-441-******',
    currency: 'EUR',
    foreignBalance: 1800000, // 180만 유로
    bookRate: 1480.00,
    endingRate: 1489.50,
    avgRate: 1484.00,
    transactionGainLoss: 2100000, // 210만원 이익
  },
  {
    id: 'acc-7',
    bankName: '신한은행',
    accountNumber: '110-892-******',
    currency: 'USD',
    foreignBalance: 8500000, // 850만 불
    bookRate: 1352.10,
    endingRate: 1368.20,
    avgRate: 1359.00,
    transactionGainLoss: 9400000, // 940만원 이익
  }
];

export const INITIAL_MONTHLY_TRENDS: MonthlyTrendData[] = [
  { month: '1월', translationGainLoss: 42.5, transactionGainLoss: 15.2, totalUsdBalance: 38.2 },
  { month: '2월', translationGainLoss: -18.4, transactionGainLoss: 8.1, totalUsdBalance: 39.5 },
  { month: '3월', translationGainLoss: 65.1, transactionGainLoss: 22.4, totalUsdBalance: 41.0 },
  { month: '4월', translationGainLoss: 88.2, transactionGainLoss: -12.5, totalUsdBalance: 40.2 },
  { month: '5월', translationGainLoss: -35.6, transactionGainLoss: 14.8, totalUsdBalance: 42.1 },
  { month: '6월', translationGainLoss: 52.3, transactionGainLoss: 19.6, totalUsdBalance: 43.5 },
  { month: '7월', translationGainLoss: 74.8, transactionGainLoss: 25.1, totalUsdBalance: 44.8 },
  { month: '8월', translationGainLoss: 98.4, transactionGainLoss: 38.5, totalUsdBalance: 45.8 },
];
