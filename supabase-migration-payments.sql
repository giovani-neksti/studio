-- ============================================
-- STUDIO AI — Tabela de Pagamentos (Stripe)
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email TEXT NOT NULL DEFAULT '',
  stripe_session_id TEXT NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,         -- valor em centavos BRL
  credits INTEGER NOT NULL,              -- créditos concedidos
  plan TEXT NOT NULL DEFAULT 'Unknown',  -- Essentials, Professional, Premium
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Políticas
DROP POLICY IF EXISTS "Service role full access payments" ON public.payments;
CREATE POLICY "Service role full access payments"
  ON public.payments FOR ALL
  USING (true);

-- 4. Índices para queries do financeiro
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON public.payments(stripe_session_id);

-- 5. Verificação
SELECT * FROM public.payments ORDER BY created_at DESC LIMIT 5;
