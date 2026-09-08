import React, { useState, useEffect } from 'react';
import { FxAccount, Currency } from './types';
import { INITIAL_FX_ACCOUNTS, INITIAL_MONTHLY_TRENDS } from './data/initialData';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { BankCurrencyTable } from './components/BankCurrencyTable';
import { CurrencyDetailView } from './components/CurrencyDetailView';
import { FinancialStatementImpactView } from './components/FinancialStatementImpactView';
import { ChartsView } from './components/ChartsView';
import { SimulationView } from './components/SimulationView';
import { AiAdvisorView } from './components/AiAdvisorView';
import { SupabaseAccumulationView } from './components/SupabaseAccumulationView';
import { UserGuideModal } from './components/UserGuideModal';
import { AddAccountModal } from './components/AddAccountModal';
import { SqlScriptModal } from './components/SqlScriptModal';
import { LoginView } from './components/LoginView';
import { calculateTranslationGainLoss } from './utils/formatters';
import { ALLOWED_BANKS } from './components/BankCurrencyTable';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  // Authentication State
  const [sessionUser, setSessionUser] = useState<{ email: string; isDemo?: boolean } | null>(() => {
    const savedDemo = localStorage.getItem('lx_mma_auth_user');
    return savedDemo ? JSON.parse(savedDemo) : null;
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // FX Accounts State
  const [accounts, setAccounts] = useState<FxAccount[]>(() => {
    const saved = localStorage.getItem('lx_mma_fx_accounts_v3');
    if (saved) {
      try {
        const parsed: FxAccount[] = JSON.parse(saved);
        const valid = parsed.filter((a) => ALLOWED_BANKS.includes(a.bankName));
        if (valid.length > 0) return valid;
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_FX_ACCOUNTS;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>('2026년 8월 (현재)');
  const [activeTab, setActiveTab] = useState<string>('table');

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState<boolean>(false);
  const [editingAccount, setEditingAccount] = useState<FxAccount | null>(null);

  // Check active Supabase session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data } = await supabase.auth.getSession();
          if (data?.session?.user) {
            const userObj = { email: data.session.user.email || 'user@lxmma.com' };
            setSessionUser(userObj);
            localStorage.setItem('lx_mma_auth_user', JSON.stringify(userObj));
          }
        }
      } catch (err) {
        console.warn('Supabase auth session check:', err);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();

    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const userObj = { email: session.user.email || 'user@lxmma.com' };
          setSessionUser(userObj);
          localStorage.setItem('lx_mma_auth_user', JSON.stringify(userObj));
        } else {
          // If signed out from Supabase
          if (!sessionUser?.isDemo) {
            setSessionUser(null);
            localStorage.removeItem('lx_mma_auth_user');
          }
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lx_mma_fx_accounts_v3', JSON.stringify(accounts));
  }, [accounts]);

  const handleLoginSuccess = (user: { email: string; isDemo?: boolean }) => {
    setSessionUser(user);
    localStorage.setItem('lx_mma_auth_user', JSON.stringify(user));
  };

  const handleSignOut = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      if (isSupabaseConfigured() && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error('Sign out error:', err);
        }
      }
      setSessionUser(null);
      localStorage.removeItem('lx_mma_auth_user');
    }
  };

  const handleSaveAccount = (account: FxAccount) => {
    setAccounts((prev) => {
      const exists = prev.some((a) => a.id === account.id);
      if (exists) {
        return prev.map((a) => (a.id === account.id ? account : a));
      } else {
        return [account, ...prev];
      }
    });
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm('정말 이 외화 계좌 데이터를 삭제하시겠습니까?')) {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleEditAccount = (account: FxAccount) => {
    setEditingAccount(account);
    setIsAddModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingAccount(null);
    setIsAddModalOpen(true);
  };

  const handleResetData = () => {
    if (window.confirm('기본 샘플 데이터로 초기화하시겠습니까?')) {
      setAccounts(INITIAL_FX_ACCOUNTS);
      localStorage.removeItem('lx_mma_fx_accounts_v3');
      localStorage.removeItem('lx_mma_fx_accounts');
    }
  };

  const handleUpdateAccountRate = (currency: Currency, newEndingRate: number) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.currency === currency ? { ...acc, endingRate: newEndingRate } : acc))
    );
  };

  const handleExportExcel = () => {
    // CSV 내보내기 구현 (비고 열 삭제, 5개 지정 은행만 포함)
    const headers = ['은행명,계좌번호,통화,외화잔액,장부지가,기말환율,외화환산손익(원),환차손익(원)\n'];
    const rows = accounts
      .filter((acc) => ALLOWED_BANKS.includes(acc.bankName))
      .map((acc) => {
        const transGL = calculateTranslationGainLoss(acc.foreignBalance, acc.endingRate, acc.bookRate);
        return `"${acc.bankName}","${acc.accountNumber}","${acc.currency}",${acc.foreignBalance},${acc.bookRate},${acc.endingRate},${transGL},${acc.transactionGainLoss}`;
      });

    const csvContent = '\uFEFF' + headers.concat(rows.join('\n')).join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LX_MMA_외화손익대시보드_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Callback to load accumulated historical data from Supabase into main view
  const handleApplyHistoricalData = (historicalAccounts: FxAccount[], month: string) => {
    setAccounts(historicalAccounts);
    setSelectedMonth(month);
    setActiveTab('table');
  };

  // If user is not authenticated, show Login Screen
  if (!sessionUser && !isAuthChecking) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-sky-100 selection:text-sky-900">
      {/* Header */}
      <Header
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenAddModal={handleOpenAddModal}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onOpenSqlModal={() => setIsSqlModalOpen(true)}
        onExportExcel={handleExportExcel}
        onResetData={handleResetData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={sessionUser?.email}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* KPI Summary Cards */}
        <SummaryCards accounts={accounts} />

        {/* Tab Navigation Views */}
        {activeTab === 'table' && (
          <BankCurrencyTable
            accounts={accounts}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeTab === 'detail' && (
          <CurrencyDetailView
            accounts={accounts}
            onUpdateAccountRate={handleUpdateAccountRate}
          />
        )}

        {activeTab === 'fs-impact' && (
          <FinancialStatementImpactView accounts={accounts} />
        )}

        {activeTab === 'charts' && (
          <ChartsView accounts={accounts} monthlyTrends={INITIAL_MONTHLY_TRENDS} />
        )}

        {activeTab === 'simulation' && (
          <SimulationView accounts={accounts} />
        )}

        {activeTab === 'ai' && (
          <AiAdvisorView accounts={accounts} selectedMonth={selectedMonth} />
        )}

        {activeTab === 'supabase' && (
          <SupabaseAccumulationView
            currentAccounts={accounts}
            selectedMonth={selectedMonth}
            userEmail={sessionUser?.email || ''}
            onApplyHistoricalDataToDashboard={handleApplyHistoricalData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>(주) LX MMA 재무 자금팀 • 외화 손익 관리 대시보드 (Supabase Auth & Database)</span>
          <span>Google AI Studio Powered</span>
        </div>
      </footer>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAccount}
        editingAccount={editingAccount}
      />

      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />

      <SqlScriptModal
        isOpen={isSqlModalOpen}
        onClose={() => setIsSqlModalOpen(false)}
      />
    </div>
  );
}

