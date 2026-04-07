-- ============================================================
-- Migration: refund_credit RPC
-- Reembolsa 1 crédito quando a geração de IA falha completamente.
-- Roda no Supabase SQL Editor (Dashboard > SQL > New Query)
-- ============================================================

CREATE OR REPLACE FUNCTION public.refund_credit(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits + 1,
      updated_at = now()
  WHERE id = user_id
  RETURNING credits INTO new_credits;

  RETURN COALESCE(new_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
