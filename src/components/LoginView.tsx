import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, SUPABASE_SETUP_SQL } from '../lib/supabase';
import { Building2, Lock, Mail, KeyRound, AlertCircle, Loader2, Database, Copy, Check, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: { email: string; isDemo?: boolean }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (!isConfigured || !supabase) {
      // Supabase credentials not yet configured in environment
      setError('Supabase 환경변수(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다. 아래 [데모 모드로 접속] 또는 SQL 및 환경 설정을 확인하세요.');
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
      setError(err.message || '인증 중 오류가 발생했습니다. 이메일과 비밀번호를 확인하세요.');
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-sky-100 selection:text-sky-900">
      <div className="w-full max-w-md">
        
        {/* Brand Card Header */}
        <div className="text-center mb-6">
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
            외화 손익 관리 보안 로그인
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supabase Auth 기반 인가된 사용자 전용 시스템
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-200/80 p-6 sm:p-7">
          
          {/* Connection Status Pill */}
          <div className="mb-5 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-700 font-medium">
                {isConfigured ? 'Supabase 클라우드 연결 준비' : 'Supabase 설정 대기 (데모 지원)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowSqlModal(true)}
              className="text-[11px] text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              <Database className="w-3 h-3" />
              <span>SQL 보기</span>
            </button>
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
              Supabase 연동 전에도 전 기능을 즉시 체험할 수 있습니다.
            </p>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-slate-400 text-[11px] mt-6">
          (주) LX MMA 재무 자금팀 보안 표준 준수
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
                <strong>환경변수 안내:</strong><br />
                Supabase 연결 시 프로젝트 URL과 anon public key를 AI Studio 설정(Settings) 메뉴에 <code>VITE_SUPABASE_URL</code> 및 <code>VITE_SUPABASE_ANON_KEY</code>로 등록하시면 됩니다.
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
