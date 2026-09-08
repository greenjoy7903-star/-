import React, { useState } from 'react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  resetSupabaseConfig,
  testSupabaseConnection,
  isSupabaseConfigured,
} from '../lib/supabase';
import {
  Database,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Link,
  KeyRound,
  HelpCircle,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const initialConfig = getSupabaseConfig();
  const [configUrl, setConfigUrl] = useState(initialConfig.url);
  const [configKey, setConfigKey] = useState(initialConfig.anonKey);
  const [showKeyText, setShowKeyText] = useState(false);
  const [testState, setTestState] = useState<{
    loading: boolean;
    status: 'idle' | 'success' | 'error';
    message: string | null;
  }>({
    loading: false,
    status: 'idle',
    message: null,
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestState({ loading: true, status: 'idle', message: null });
    const res = await testSupabaseConnection(configUrl, configKey);
    setTestState({
      loading: false,
      status: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleSave = () => {
    if (!configUrl.trim() || !configKey.trim()) {
      setTestState({
        loading: false,
        status: 'error',
        message: 'URL과 Anon Public API Key를 모두 입력해 주세요.',
      });
      return;
    }
    const saved = saveSupabaseConfig(configUrl, configKey);
    if (saved) {
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 3000);
      handleTestConnection();
      if (onConfigChanged) onConfigChanged();
    }
  };

  const handleReset = () => {
    resetSupabaseConfig();
    const current = getSupabaseConfig();
    setConfigUrl(current.url);
    setConfigKey(current.anonKey);
    setTestState({ loading: false, status: 'idle', message: null });
    if (onConfigChanged) onConfigChanged();
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-sky-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Supabase 연결 설정</h3>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    configured
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {configured ? '설정 완료' : '설정 필요'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Project URL 및 Anon Public API Key 설정</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
          <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl text-slate-600 space-y-1 text-[11px] leading-relaxed">
            <div className="font-semibold text-sky-900 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>연결 정보 확인 가이드</span>
            </div>
            <p>
              1. <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-sky-600 font-semibold underline">Supabase 콘솔</a> &gt; <strong>Project Settings &gt; API</strong>로 이동합니다.<br />
              2. <strong>Project URL</strong>과 <strong>Project API keys (anon, public)</strong>를 복사하여 아래에 입력하세요.
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

          {/* Test Status Message */}
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
              <span>설정이 성공적으로 저장되었습니다.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-slate-500 hover:text-slate-800 text-xs font-medium transition"
          >
            기본값 초기화
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testState.loading}
              className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
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
              onClick={handleSave}
              className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>저장</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
