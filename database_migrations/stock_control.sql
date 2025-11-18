-- Sistema de Controle de Estoque
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar campo de estoque se não existir (já existe, mas verificando)
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- 2. Função para decrementar estoque de forma segura
CREATE OR REPLACE FUNCTION decrement_product_stock(
  product_uuid UUID,
  quantity_to_decrement INTEGER
)
RETURNS TABLE(success BOOLEAN, new_stock INTEGER, message TEXT) AS $$
DECLARE
  current_stock INTEGER;
  updated_stock INTEGER;
BEGIN
  -- Bloquear a linha do produto para evitar race conditions
  SELECT stock INTO current_stock
  FROM products
  WHERE id = product_uuid
  FOR UPDATE;

  -- Verificar se o produto existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Produto não encontrado';
    RETURN;
  END IF;

  -- Verificar se há estoque suficiente
  IF current_stock < quantity_to_decrement THEN
    RETURN QUERY SELECT FALSE, current_stock, 'Estoque insuficiente';
    RETURN;
  END IF;

  -- Decrementar o estoque
  UPDATE products
  SET stock = stock - quantity_to_decrement,
      updated_at = NOW()
  WHERE id = product_uuid
  RETURNING stock INTO updated_stock;

  RETURN QUERY SELECT TRUE, updated_stock, 'Estoque atualizado com sucesso';
END;
$$ LANGUAGE plpgsql;

-- 3. Função para incrementar estoque (cancelamentos, devoluções)
CREATE OR REPLACE FUNCTION increment_product_stock(
  product_uuid UUID,
  quantity_to_increment INTEGER
)
RETURNS TABLE(success BOOLEAN, new_stock INTEGER, message TEXT) AS $$
DECLARE
  updated_stock INTEGER;
BEGIN
  UPDATE products
  SET stock = stock + quantity_to_increment,
      updated_at = NOW()
  WHERE id = product_uuid
  RETURNING stock INTO updated_stock;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'Produto não encontrado';
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, updated_stock, 'Estoque incrementado com sucesso';
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para alertas de estoque baixo (opcional - salva em tabela de alertas)
CREATE TABLE IF NOT EXISTS stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  stock_level INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  stock_threshold INTEGER := 10; -- Threshold padrão
BEGIN
  -- Se o estoque caiu abaixo do threshold, criar alerta
  IF NEW.stock <= stock_threshold AND NEW.stock < OLD.stock THEN
    INSERT INTO stock_alerts (product_id, stock_level, threshold)
    VALUES (NEW.id, NEW.stock, stock_threshold)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Se o estoque foi reabastecido, marcar alertas como resolvidos
  IF NEW.stock > stock_threshold AND NEW.stock > OLD.stock THEN
    UPDATE stock_alerts
    SET resolved = TRUE
    WHERE product_id = NEW.id AND resolved = FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_check_low_stock ON products;
CREATE TRIGGER trigger_check_low_stock
  AFTER UPDATE OF stock ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();

-- 5. View para produtos com estoque baixo
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.name,
  p.slug,
  p.stock,
  p.partner_id,
  p.partner_name,
  CASE 
    WHEN p.stock = 0 THEN 'out_of_stock'
    WHEN p.stock <= 5 THEN 'critical'
    WHEN p.stock <= 10 THEN 'low'
    ELSE 'ok'
  END as stock_status
FROM products p
WHERE p.stock <= 10
ORDER BY p.stock ASC;

-- 6. Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
CREATE INDEX IF NOT EXISTS idx_stock_alerts_product_resolved ON stock_alerts(product_id, resolved);

-- 7. RLS Policies para stock_alerts
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;

-- Admins podem ver todos os alertas
CREATE POLICY "Admins can view all stock alerts" ON stock_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Partners podem ver alertas dos seus produtos
CREATE POLICY "Partners can view their product alerts" ON stock_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = stock_alerts.product_id
      AND products.partner_id = auth.uid()
    )
  );

-- Apenas admins podem marcar como resolvido
CREATE POLICY "Admins can update stock alerts" ON stock_alerts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON FUNCTION decrement_product_stock IS 'Decrementa o estoque de um produto de forma segura com validação';
COMMENT ON FUNCTION increment_product_stock IS 'Incrementa o estoque (para cancelamentos/devoluções)';
COMMENT ON TABLE stock_alerts IS 'Alertas de estoque baixo para admins e parceiros';
COMMENT ON VIEW low_stock_products IS 'View com produtos com estoque igual ou menor que 10 unidades';
