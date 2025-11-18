-- ============================================
-- Adicionar campos de filtro aos produtos
-- Para suportar busca avançada estilo Marketplace
-- ============================================

-- 1. Adicionar colunas à tabela products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('new', 'used', 'refurbished')),
ADD COLUMN IF NOT EXISTS availability TEXT CHECK (availability IN ('in_stock', 'low_stock', 'pre_order', 'out_of_stock')),
ADD COLUMN IF NOT EXISTS old_price DECIMAL(10, 2);

-- 2. Criar índices para melhorar performance das buscas
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_condition ON public.products(condition);
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products(availability);
CREATE INDEX IF NOT EXISTS idx_products_price_range ON public.products(price);

-- 3. Criar índice de busca full-text para o nome do produto
CREATE INDEX IF NOT EXISTS idx_products_name_search ON public.products USING gin(to_tsvector('portuguese', name));

-- 4. Atualizar produtos existentes com valores padrão
UPDATE public.products
SET 
  condition = 'new',
  availability = 'in_stock'
WHERE condition IS NULL OR availability IS NULL;

-- 5. Comentários nas colunas para documentação
COMMENT ON COLUMN public.products.brand IS 'Marca do produto (ex: Samsung, Apple, Logitech)';
COMMENT ON COLUMN public.products.condition IS 'Condição do produto: new (novo), used (usado), refurbished (recondicionado)';
COMMENT ON COLUMN public.products.availability IS 'Disponibilidade: in_stock (em estoque), low_stock (estoque baixo), pre_order (pré-venda), out_of_stock (fora de estoque)';
COMMENT ON COLUMN public.products.old_price IS 'Preço antigo para mostrar desconto';

-- 6. Verificação
SELECT 
  'Colunas adicionadas com sucesso!' as status,
  COUNT(*) as total_products,
  COUNT(brand) as products_with_brand,
  COUNT(condition) as products_with_condition,
  COUNT(availability) as products_with_availability
FROM public.products;

-- 7. Listar estrutura atualizada
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('brand', 'condition', 'availability', 'old_price')
ORDER BY column_name;
