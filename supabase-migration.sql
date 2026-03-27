-- ============================================
-- STUDIO AI — Tabela de Perfis com Créditos
-- Execute este SQL no Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Criar tabela de perfis (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL DEFAULT '',
  credits INTEGER NOT NULL DEFAULT 3,
  total_generations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Dropar políticas antigas (caso existam) e recriar
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;

-- Usuário só vê o próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Service role (API backend) pode tudo
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (true);

-- 4. Trigger: criar perfil automaticamente quando novo user registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (NEW.id, COALESCE(NEW.email, ''), 3)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dropar trigger se já existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Criar perfis para usuários que já existem (migração retroativa)
INSERT INTO public.profiles (id, email, credits)
SELECT id, COALESCE(email, ''), 3
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 6. Função RPC para decrementar crédito atomicamente
CREATE OR REPLACE FUNCTION public.decrement_credit(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  UPDATE public.profiles
  SET credits = credits - 1,
      total_generations = total_generations + 1,
      updated_at = now()
  WHERE id = user_id AND credits > 0
  RETURNING credits INTO new_credits;

  IF new_credits IS NULL THEN
    SELECT credits INTO new_credits FROM public.profiles WHERE id = user_id;
    IF new_credits IS NULL THEN
      RAISE EXCEPTION 'Perfil não encontrado';
    END IF;
  END IF;

  RETURN new_credits;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Índices para buscas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- 8. Verificação: listar todos os perfis criados
SELECT id, email, credits, total_generations, created_at FROM public.profiles ORDER BY created_at;
