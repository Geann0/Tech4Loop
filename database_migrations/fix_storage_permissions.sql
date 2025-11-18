-- ========================================
-- FIX: Configuração do Storage para Imagens
-- Execute no Supabase SQL Editor
-- ========================================

-- 1. Verificar se o bucket existe
SELECT * FROM storage.buckets WHERE name = 'product_images';

-- Se NÃO existir, você precisa criar manualmente via UI:
-- 1. Vá em Storage (menu lateral)
-- 2. Clique em "New bucket"
-- 3. Nome: product_images
-- 4. Marque "Public bucket"
-- 5. Clique em "Create bucket"

-- 2. Verificar políticas do bucket
SELECT * FROM storage.policies WHERE bucket_id = 'product_images';

-- 3. DELETAR políticas antigas (se existirem)
DROP POLICY IF EXISTS "Admin can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can view images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Partners can upload to their own folder." ON storage.objects;
DROP POLICY IF EXISTS "Partners can view their own images." ON storage.objects;
DROP POLICY IF EXISTS "Partners can update their own images." ON storage.objects;
DROP POLICY IF EXISTS "Partners can delete their own images." ON storage.objects;

-- 4. CRIAR POLÍTICAS CORRETAS

-- Política 1: Público pode VER todas as imagens
CREATE POLICY "public_can_view_product_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product_images');

-- Política 2: Service Role (Admin) pode fazer TUDO
-- NOTA: Service role bypassa RLS, mas é bom ter a política

-- Política 3: Admins autenticados podem INSERIR
CREATE POLICY "admins_can_insert_product_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product_images' 
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política 4: Admins podem ATUALIZAR
CREATE POLICY "admins_can_update_product_images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product_images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'product_images'
);

-- Política 5: Admins podem DELETAR
CREATE POLICY "admins_can_delete_product_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product_images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política 6: Parceiros podem INSERIR na sua pasta
CREATE POLICY "partners_can_insert_their_images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'partner'
  )
);

-- Política 7: Parceiros podem VER suas imagens
CREATE POLICY "partners_can_view_their_images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Política 8: Parceiros podem ATUALIZAR suas imagens
CREATE POLICY "partners_can_update_their_images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
)
WITH CHECK (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Política 9: Parceiros podem DELETAR suas imagens
CREATE POLICY "partners_can_delete_their_images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product_images'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- 5. Verificar se as políticas foram criadas
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';

-- ========================================
-- TESTE FINAL
-- ========================================
-- Listar arquivos no bucket (se houver)
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'product_images'
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- NOTAS IMPORTANTES
-- ========================================
-- 1. O Service Role Key (usado no servidor) bypassa RLS
-- 2. Se ainda falhar, verifique o .env.local:
--    - SUPABASE_SERVICE_ROLE_KEY está correto?
-- 3. O bucket PRECISA ser público para exibir imagens
-- 4. Formato de pasta esperado: {partner_id}/{timestamp}-{filename}
