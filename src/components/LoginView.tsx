import React, { useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseConfig,
  testSupabaseConnection,
  SUPABASE_SETUP_SQL,
} from '../lib/supabase';
import {
  Building2,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Loader2,
  Database,
  Copy,
  Check,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Settings2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Eye,
  EyeOff,
  Link,
  HelpCircle,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; isDemo?: boolean }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  // Supabase Configuration State
  const initialConfig = getSupabaseConfig();
  const [configUrl, setConfigUrl] = useState(initialConfig.url);
  const [configKey, setConfigKey] = useState(initialConfig.anonKey);
  const [showConfig, setShowConfig] = useState(!isSupabaseConfigured());
  const [showKeyText, setShowKeyText] = useState(false);
  const [testState, setTestState] = useState<{ loading: boolean; status: 'idle' | 'success' | 'error'; message: string | null }>({
    loading: false,
    status: 'idle',
    message: null,
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const configured = isSupabaseConfigured();

  // Test Supabase Connection
  const handleTestConnection = async () => {
    setTestState({ loading: true, status: 'idle', message: null });
    const res = await testSupabaseConnection(configUrl, configKey);
    setTestState({
      loading: false,
      status: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  // Save Supabase Configuration
  const handleSaveConfig = () => {
    if (!configUrl.trim() || !configKey.trim()) {
      setTestState({
        loading: false,
        status: 'error',
        message: 'URL과 Anon Public Key를 모두 입력해 주세요.',
      });
      return;
    }
    const saved = saveSupabaseConfig(configUrl, configKey);
    if (saved) {
      setSaveSuccessMsg(true);
      setError(null);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
      handleTestConnection();
    }
  };

  // Reset Supabase Configuration
  const handleResetConfig = () => {
    resetSupabaseConfig();
    const current = getSupabaseConfig();
    setConfigUrl(current.url);
    setConfigKey(current.anonKey);
    setTestState({ loading: false, status: 'idle', message: null });
    setError(null);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase 연결 설정이 완료되지 않았습니다. 위 [Supabase 연결 설정]에서 Project URL과 Anon Key를 입력하고 저장해 주세요.');
      setShowConfig(true);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Supabase v2 signUp
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data.session) {
          onLoginSuccess({ email: data.user?.email || email });
        } else {
          setMessage('가입 확인 이메일이 발송되었거나 계정이 생성되었습니다. 로그인해 주세요.');
          setIsSignUp(false);
        }
      } else {
        // Supabase v2 signInWithPassword
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onLoginSuccess({ email: data.user.email || email });
        }
      }
    } catch (err: any) {
      setError(err.message || '인증 중 오류가 발생했습니다. 이메일과 비밀번호 또는 Supabase 설정을 확인하세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({ email: email || 'finance.admin@lxmma.com', isDemo: true });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-sky-100 selection:text-sky-900 py-10">
      <div className="w-full max-w-lg space-y-4">
        
        {/* Brand Card Header */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white shadow-sm mb-3">
            <Building2 className="w-6 h-6 text-sky-400" />
          </div>
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="text-[11px] font-semibold tracking-tight px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-800">
              (주) LX MMA
            </span>
            <span className="text-[11px] text-slate-500 font-medium">재무 자금팀</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            외화 손익 관리 보안 시스템
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supabase 데이터베이스 연동 & 보안 인가 로그인
          </p>
        </div>

        {/* Supabase Configuration Card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-200/90 overflow-hidden transition">
          {/* Header Bar */}
          <div className="p-4 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-bold text-slate-900">Supabase 연결 설정</h2>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      configured
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${configured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {configured ? '설정 완료' : '설정 필요'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Project URL 및 Anon Public API Key 설정</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition flex items-center gap-1 shadow-2xs"
                title="DB 테이블 생성 SQL 보기"
              >
                <Database className="w-3 h-3 text-sky-600" />
                <span>SQL</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                title={showConfig ? '설정 접기' : '설정 열기'}
              >
                {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Collapsible Config Body */}
          {showConfig && (
            <div className="p-5 space-y-4 text-xs bg-white">
              <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl text-slate-600 space-y-1 text-[11px] leading-relaxed">
                <div className="font-semibold text-sky-900 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                  <span>Supabase 연결 정보 확인 방법</span>
                </div>
                <p>
                  1. Supabase 콘솔 &gt; <strong>Project Settings &gt; API</strong> 메뉴로 이동합니다.<br />
                  2. <strong>Project URL</strong>과 <strong>Project API keys (anon / public)</strong>를 복사하여 아래에 입력하세요.
                </p>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-slate-400" />
                  <span>Supabase Project URL</span>
                </label>
                <input
                  type="text"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-[11px] text-slate-800 transition"
                />
              </div>

              {/* Anon Key Input */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                    <span>Supabase Anon Public API Key</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                  >
                    {showKeyText ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showKeyText ? '숨기기' : '표시'}</span>
                  </button>
                </label>
                <input
                  type={showKeyText ? 'text' : 'password'}
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-mono text-[11px] text-slate-800 transition"
                />
              </div>

              {/* Connection Status Feedback */}
              {testState.message && (
                <div
                  className={`p-2.5 rounded-xl border text-[11px] flex items-start gap-2 ${
                    testState.status === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-600'
                  }`}
                >
                  {testState.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <span>{testState.message}</span>
                </div>
              )}

              {saveSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>설정이 안전하게 저장되었습니다. 이제 바로 로그인하거나 회원을 등록할 수 있습니다.</span>
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-medium transition"
                >
                  초기화
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testState.loading}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {testState.loading ? (
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                    ) : (
                      <RefreshCw className="w-3 h-3 text-slate-500" />
                    )}
                    <span>연결 테스트</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>설정 저장</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-200/80 p-6 sm:p-7">
          
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-sky-500" />
              <span>{isSignUp ? '신규 인가 사용자 등록' : '사내 계정 로그인'}</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-medium">
              {configured ? 'Supabase 클라우드 인증' : '설정 대기 상태'}
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>업무용 이메일</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="예: user@lxmma.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>비밀번호</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자리 이상 비밀번호"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-800 transition"
              />
            </div>

            {/* Error & Info Alerts */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-start gap-2 text-[11px] leading-relaxed">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>인증 확인 중...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isSignUp ? '신규 사용자 등록' : '인가 사용자 로그인'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{isSignUp ? '이미 계정이 있으신가요?' : '신규 인가 계정이 필요하신가요?'}</span>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-sky-600 hover:text-sky-700 font-semibold"
            >
              {isSignUp ? '기존 계정으로 로그인' : '신규 계정 생성'}
            </button>
          </div>

          {/* Demo Fallback for AI Studio Preview */}
          <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>사내 인가 계정 데모 모드로 바로 시작</span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Supabase 클라우드 설정 전에도 시스템의 모든 시뮬레이션 및 관리 기능을 체험하실 수 있습니다.
            </p>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-slate-400 text-[11px] mt-4">
          (주) LX MMA 재무 자금팀 • 외화 자산 및 부채 환차손익 관리 시스템
        </p>

      </div>

      {/* Supabase SQL Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Supabase DB 생성 SQL 스크립트</h3>
              </div>
              <button
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg text-xs"
              >
                닫기
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Supabase Dashboard &gt; <strong>SQL Editor</strong>에 붙여넣어 실행하시면, 외화 손익 누적 저장용 <code>fx_records</code> 테이블과 행 단위 보안 정책(RLS)이 자동 구성됩니다.
              </p>

              <div className="relative">
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                  {SUPABASE_SETUP_SQL}
                </pre>
                <button
                  onClick={handleCopySql}
                  className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? '복사됨' : 'SQL 복사'}</span>
                </button>
              </div>

              <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl text-sky-800 text-[11px] leading-relaxed">
                <strong>설정 팁:</strong><br />
                위의 [Supabase 연결 설정] 카드에 Project URL과 anon public key를 입력하시면 브라우저에 바로 저장되며, 환경 변수(<code>.env</code>)로도 설정하실 수 있습니다.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
