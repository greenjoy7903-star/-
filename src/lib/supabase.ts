import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

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
