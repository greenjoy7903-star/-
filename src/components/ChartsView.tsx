import React from 'react';
import { FxAccount, MonthlyTrendData } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface ChartsViewProps {
  accounts: FxAccount[];
  monthlyTrends: MonthlyTrendData[];
}

export const ChartsView: React.FC<ChartsViewProps> = ({ accounts, monthlyTrends }) => {
  const validAccounts = accounts.filter((acc) => ALLOWED_BANKS.includes(acc.bankName));

  // 통화별 집계 (USD, EUR, JPY)
  const currencyMap: { [key: string]: number } = {};
  validAccounts.forEach((acc) => {
    let usdVal = acc.foreignBalance;
    if (acc.currency === 'EUR') usdVal = acc.foreignBalance * 1.08;
    if (acc.currency === 'JPY') usdVal = acc.foreignBalance / 150;

    currencyMap[acc.currency] = (currencyMap[acc.currency] || 0) + usdVal;
  });

  const currencyPieData = Object.keys(currencyMap).map((curr) => ({
    name: curr,
    value: Math.round(currencyMap[curr] / 1000000),
  }));

  const COLORS = ['#38bdf8', '#34d399', '#a78bfa', '#fb923c'];

  // 은행별 집계
  const bankMap: { [key: string]: number } = {};
  validAccounts.forEach((acc) => {
    let usdVal = acc.foreignBalance;
    if (acc.currency === 'EUR') usdVal = acc.foreignBalance * 1.08;
    if (acc.currency === 'JPY') usdVal = acc.foreignBalance / 150;

    bankMap[acc.bankName] = (bankMap[acc.bankName] || 0) + usdVal;
  });

  const bankBarData = Object.keys(bankMap).map((bank) => ({
    name: bank,
    balance: Math.round(bankMap[bank] / 1000000),
  }));

  return (
    <div className="space-y-6 mb-8">
      {/* Top Monthly Trend Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <span>월별 외화환산손익 및 환차손익 추이</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              단위: 백만 원 (음수 환산손익은 차트 및 표에서 ▲ 표기)
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  color: '#0f172a',
                  border: '1px solid #e2e8f0',
                  fontSize: '11px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}
                formatter={(val: any) => {
                  const num = Number(val);
                  if (num < 0) {
                    return [`▲ ${Math.abs(num)} 백만 원 (손실)`, ''];
                  }
                  return [`${num} 백만 원 (이익)`, ''];
                }}
              />
              <Legend />
              <Bar dataKey="translationGainLoss" name="환산손익 (평가)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transactionGainLoss" name="환차손익 (실현)" fill="#34d399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Two Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Currency Exposure Pie */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500" />
              <span>통화별 외화예금 비중</span>
            </h3>
            <span className="text-[11px] text-slate-400">USD 환산</span>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {currencyPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${val}M`, '환산 잔액']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Concentration Bar */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] border border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              <span>은행별 예금 현황</span>
            </h3>
            <span className="text-[11px] text-slate-400">USD 백만불</span>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankBarData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={85} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`$${val}M`, '예금 잔액']}
                />
                <Bar dataKey="balance" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
