-- ========================================
-- FIX: Permissões da tabela CATEGORIES
-- Execute este script no Supabase SQL Editor
-- ========================================

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'categories'
);

-- 2. Ver estrutura atual da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'categories';

-- 3. Ver políticas RLS atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'categories';

-- 4. DELETAR POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Public can view all categories." ON public.categories;
DROP POLICY IF EXISTS "Admins can manage all categories." ON public.categories;

-- 5. RECRIAR POLÍTICAS CORRETAS

-- Política 1: Todos podem VER categorias (público)
CREATE POLICY "categories_select_policy" ON public.categories
  FOR SELECT
  USING (true);

-- Política 2: Apenas ADMINS podem INSERIR categorias
CREATE POLICY "categories_insert_policy" ON public.categories
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política 3: Apenas ADMINS podem ATUALIZAR categorias
CREATE POLICY "categories_update_policy" ON public.categories
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Política 4: Apenas ADMINS podem DELETAR categorias
CREATE POLICY "categories_delete_policy" ON public.categories
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 6. GARANTIR que RLS está ATIVADO
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 7. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);

-- 8. TESTAR: Ver todas as categorias
SELECT * FROM public.categories ORDER BY name;

-- 9. Ver contagem
SELECT COUNT(*) as total_categorias FROM public.categories;

-- ========================================
-- TESTE FINAL
-- ========================================
-- Se você conseguir ver as categorias aqui,
-- mas não no app, o problema é nas credenciais
-- do Supabase no arquivo .env.local
