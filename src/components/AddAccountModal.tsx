import React, { useState, useEffect } from 'react';
import { FxAccount, Currency } from '../types';
import { X, Save } from 'lucide-react';
import { ALLOWED_BANKS } from './BankCurrencyTable';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: FxAccount) => void;
  editingAccount?: FxAccount | null;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAccount,
}) => {
  const [bankName, setBankName] = useState('신한은행');
  const [accountNumber, setAccountNumber] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [foreignBalance, setForeignBalance] = useState<number>(1000000);
  const [bookRate, setBookRate] = useState<number>(1350);
  const [endingRate, setEndingRate] = useState<number>(1368.2);
  const [avgRate, setAvgRate] = useState<number>(1360);
  const [transactionGainLoss, setTransactionGainLoss] = useState<number>(0);

  useEffect(() => {
    if (editingAccount) {
      setBankName(ALLOWED_BANKS.includes(editingAccount.bankName) ? editingAccount.bankName : '신한은행');
      setAccountNumber(editingAccount.accountNumber);
      setCurrency(editingAccount.currency);
      setForeignBalance(editingAccount.foreignBalance);
      setBookRate(editingAccount.bookRate);
      setEndingRate(editingAccount.endingRate);
      setAvgRate(editingAccount.avgRate);
      setTransactionGainLoss(editingAccount.transactionGainLoss);
    } else {
      setBankName('신한은행');
      setAccountNumber('110-' + Math.floor(100 + Math.random() * 900) + '-******');
      setCurrency('USD');
      setForeignBalance(5000000);
      setBookRate(1355.0);
      setEndingRate(1368.2);
      setAvgRate(1360.0);
      setTransactionGainLoss(0);
    }
  }, [editingAccount, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAccount: FxAccount = {
      id: editingAccount ? editingAccount.id : 'acc-' + Date.now(),
      bankName,
      accountNumber: accountNumber || '100-111-******',
      currency,
      foreignBalance: Number(foreignBalance),
      bookRate: Number(bookRate),
      endingRate: Number(endingRate),
      avgRate: Number(avgRate),
      transactionGainLoss: Number(transactionGainLoss),
    };
    onSave(newAccount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {editingAccount ? '외화 계좌 정보 수정' : '신규 외화 계좌 등록'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">은행명</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-800 font-medium"
              >
                {ALLOWED_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">통화</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold text-slate-800"
              >
                <option value="USD">USD (미국 달러)</option>
                <option value="EUR">EUR (유로)</option>
                <option value="JPY">JPY (일본 엔)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">계좌번호</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="예: 110-345-******"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">외화 잔액</label>
              <input
                type="number"
                step="any"
                value={foreignBalance}
                onChange={(e) => setForeignBalance(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">장부지가 (원)</label>
              <input
                type="number"
                step="0.01"
                value={bookRate}
                onChange={(e) => setBookRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">기말환율 (원)</label>
              <input
                type="number"
                step="0.01"
                value={endingRate}
                onChange={(e) => setEndingRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">환차손익 (실현 원화)</label>
              <input
                type="number"
                step="any"
                value={transactionGainLoss}
                onChange={(e) => setTransactionGainLoss(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono text-slate-800"
                required
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition text-xs"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition text-xs shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-sky-400" />
              <span>저장</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
