-- ============================================
-- FIX: Políticas RLS para Orders e Order Items
-- Mantém RLS habilitado com políticas corretas
-- ============================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- https://plphgrlkszglrawjgtvn.supabase.co/project/plphgrlkszglrawjgtvn/sql/new

-- 1. Remover TODAS as políticas existentes de orders
DROP POLICY IF EXISTS "Admins can manage all orders." ON public.orders;
DROP POLICY IF EXISTS "Partners can view their own orders." ON public.orders;
DROP POLICY IF EXISTS "Public can create orders." ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can delete all orders" ON public.orders;
DROP POLICY IF EXISTS "Partners can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "allow_public_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_public_select_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_admin_update_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_partner_update_own_orders" ON public.orders;
DROP POLICY IF EXISTS "allow_admin_delete_orders" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.orders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;

-- 2. Remover TODAS as políticas existentes de order_items
DROP POLICY IF EXISTS "Admins can manage all order items." ON public.order_items;
DROP POLICY IF EXISTS "Partners can view items from their orders." ON public.order_items;
DROP POLICY IF EXISTS "Public can create order items." ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can update all order items" ON public.order_items;
DROP POLICY IF EXISTS "Partners can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "allow_public_insert_order_items" ON public.order_items;
DROP POLICY IF EXISTS "allow_public_select_order_items" ON public.order_items;
DROP POLICY IF EXISTS "allow_admin_update_order_items" ON public.order_items;
DROP POLICY IF EXISTS "allow_admin_delete_order_items" ON public.order_items;
DROP POLICY IF EXISTS "Enable insert for anon users" ON public.order_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_items;

-- 3. Criar políticas CORRETAS para ORDERS
-- INSERT: Permitir anônimos E autenticados criarem pedidos
CREATE POLICY "Enable insert for anon users"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- SELECT: Todos podem ler (necessário para confirmação)
CREATE POLICY "Enable read access for all users"
ON public.orders
FOR SELECT
USING (true);

-- UPDATE: Apenas admins e parceiros (donos) podem atualizar
CREATE POLICY "Enable update for admins and owners"
ON public.orders
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND (
    -- Admin pode tudo
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    -- Parceiro só seus próprios pedidos
    (partner_id = auth.uid())
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR
    (partner_id = auth.uid())
  )
);

-- DELETE: Apenas admins
CREATE POLICY "Enable delete for admins only"
ON public.orders
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 4. Criar políticas CORRETAS para ORDER_ITEMS
-- INSERT: Permitir anônimos E autenticados criarem itens
CREATE POLICY "Enable insert for anon users"
ON public.order_items
FOR INSERT
WITH CHECK (true);

-- SELECT: Todos podem ler
CREATE POLICY "Enable read access for all users"
ON public.order_items
FOR SELECT
USING (true);

-- UPDATE: Apenas admins
CREATE POLICY "Enable update for admins only"
ON public.order_items
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- DELETE: Apenas admins
CREATE POLICY "Enable delete for admins only"
ON public.order_items
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- 5. Garantir que RLS está HABILITADO
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6. Verificação
SELECT 'Políticas RLS configuradas com sucesso! RLS mantido habilitado.' as status;

-- 7. Listar políticas criadas
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as operation,
  CASE 
    WHEN roles::text = '{public}' THEN 'public (anon + auth)'
    ELSE roles::text 
  END as applies_to
FROM pg_policies 
WHERE tablename IN ('orders', 'order_items')
  AND schemaname = 'public'
ORDER BY tablename, policyname;
