import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration helper
export function getSupabaseConfig(): { url: string; anonKey: string; isCustom: boolean } {
  const customUrl = (typeof window !== 'undefined' ? localStorage.getItem('lx_mma_supabase_url') : '') || '';
  const customKey = (typeof window !== 'undefined' ? localStorage.getItem('lx_mma_supabase_anon_key') : '') || '';
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (customUrl && customKey) {
    return { url: customUrl.trim(), anonKey: customKey.trim(), isCustom: true };
  }
  return { url: envUrl.trim(), anonKey: envKey.trim(), isCustom: false };
}

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http'));
};

let currentClient: SupabaseClient | null = null;

function initClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey && url.startsWith('http')) {
    try {
      currentClient = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return currentClient;
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      currentClient = null;
      return null;
    }
  }
  currentClient = null;
  return null;
}

// Initial client creation
initClient();

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  try {
    localStorage.setItem('lx_mma_supabase_url', url.trim());
    localStorage.setItem('lx_mma_supabase_anon_key', anonKey.trim());
    initClient();
    return true;
  } catch (e) {
    console.error('Failed to save Supabase config:', e);
    return false;
  }
}

export function resetSupabaseConfig(): void {
  try {
    localStorage.removeItem('lx_mma_supabase_url');
    localStorage.removeItem('lx_mma_supabase_anon_key');
    initClient();
  } catch (e) {
    console.error('Failed to reset Supabase config:', e);
  }
}

export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<{ success: boolean; message: string }> {
  try {
    const config = getSupabaseConfig();
    const targetUrl = (url !== undefined ? url : config.url).trim();
    const targetKey = (anonKey !== undefined ? anonKey : config.anonKey).trim();

    if (!targetUrl || !targetKey) {
      return { success: false, message: 'URL과 Anon API Key를 모두 입력해 주세요.' };
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return { success: false, message: 'URL은 https:// 로 시작해야 합니다.' };
    }

    const testClient = createClient(targetUrl, targetKey, {
      auth: { persistSession: false },
    });

    const { error } = await testClient.auth.getSession();
    if (error && !error.message.includes('Auth session missing')) {
      return { success: false, message: `연결 오류: ${error.message}` };
    }

    return { success: true, message: 'Supabase 프로젝트에 정상적으로 연결되었습니다.' };
  } catch (err: any) {
    return { success: false, message: err.message || '연결 테스트 중 오류가 발생했습니다.' };
  }
}

// Transparent proxy for supabase client
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!currentClient) {
      initClient();
    }
    if (!currentClient) {
      return undefined;
    }
    const val = (currentClient as any)[prop];
    return typeof val === 'function' ? val.bind(currentClient) : val;
  },
});

export interface FxDbRecord {
  id?: string;
  created_at?: string;
  record_month: string;
  bank_name: string;
  account_number: string;
  currency: string;
  foreign_balance: number;
  book_rate: number;
  ending_rate: number;
  transaction_gain_loss: number;
  translation_gain_loss: number;
  total_gain_loss: number;
  uploaded_by?: string | null;
}

export const SUPABASE_SETUP_SQL = `-- (주) LX MMA 외화 손익 누적 관리 테이블 및 보안 정책 SQL
-- Supabase SQL Editor 에 붙여넣어 실행하세요.

CREATE TABLE IF NOT EXISTS public.fx_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    record_month VARCHAR(50) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    foreign_balance NUMERIC(18, 4) NOT NULL,
    book_rate NUMERIC(14, 4) NOT NULL,
    ending_rate NUMERIC(14, 4) NOT NULL,
    transaction_gain_loss NUMERIC(18, 2) NOT NULL DEFAULT 0,
    translation_gain_loss NUMERIC(18, 2) NOT NULL DEFAULT 0,
    total_gain_loss NUMERIC(18, 2) NOT NULL DEFAULT 0,
    uploaded_by VARCHAR(255)
);

-- 인덱스 생성 (월별 조회 및 시계열 조회 최적화)
CREATE INDEX IF NOT EXISTS idx_fx_records_month ON public.fx_records(record_month);
CREATE INDEX IF NOT EXISTS idx_fx_records_bank ON public.fx_records(bank_name);
CREATE INDEX IF NOT EXISTS idx_fx_records_created_at ON public.fx_records(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.fx_records ENABLE ROW LEVEL SECURITY;

-- 인가된 사용자(Authenticated Users) 대상 읽기 정책
CREATE POLICY "인증된 사용자의 외화 기록 조회 허용"
ON public.fx_records
FOR SELECT
TO authenticated
USING (true);

-- 인가된 사용자(Authenticated Users) 대상 쓰기(누적 저장) 정책
CREATE POLICY "인증된 사용자의 외화 기록 누적 추가 허용"
ON public.fx_records
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 인가된 사용자의 외화 기록 삭제 허용
CREATE POLICY "인증된 사용자의 외화 기록 삭제 허용"
ON public.fx_records
FOR DELETE
TO authenticated
USING (true);
`;
