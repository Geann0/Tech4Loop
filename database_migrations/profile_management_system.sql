-- =====================================================
-- PROFILE MANAGEMENT SYSTEM - DATABASE MIGRATIONS
-- =====================================================
-- Este arquivo cria as tabelas necessárias para o sistema
-- completo de gerenciamento de perfil de usuários
-- =====================================================

-- =====================================================
-- 1. TABELA DE ENDEREÇOS DE USUÁRIOS
-- =====================================================
-- Armazena endereços salvos pelos usuários para facilitar checkout

CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL, -- Ex: "Casa", "Trabalho", "Mãe"
  recipient_name VARCHAR(255) NOT NULL, -- Nome de quem receberá
  zip_code VARCHAR(8) NOT NULL, -- CEP sem formatação
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(100), -- Opcional
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL, -- UF
  is_default BOOLEAN DEFAULT false, -- Endereço padrão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_default ON user_addresses(user_id, is_default);

-- RLS (Row Level Security) Policies
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios endereços
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem inserir seus próprios endereços
CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios endereços
CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas seus próprios endereços
CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. TABELA DE FAVORITOS (WISHLIST)
-- =====================================================
-- Permite usuários salvarem produtos favoritos

CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- Evita duplicatas
);

-- Índices
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_product_id ON favorites(product_id);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem adicionar favoritos
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem remover seus próprios favoritos
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Qualquer um pode ver contagem de favoritos (para analytics)
CREATE POLICY "Anyone can count favorites"
  ON favorites FOR SELECT
  USING (true);

-- =====================================================
-- 3. TABELA DE AVALIAÇÕES DE PRODUTOS
-- =====================================================
-- Permite usuários avaliarem produtos comprados

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id) -- Um usuário só pode avaliar um produto uma vez
);

-- Índices
CREATE INDEX idx_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_reviews_created ON product_reviews(created_at DESC);

-- RLS Policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver avaliações (públicas)
CREATE POLICY "Anyone can view reviews"
  ON product_reviews FOR SELECT
  USING (true);

-- Usuários podem inserir suas próprias avaliações
CREATE POLICY "Users can insert own reviews"
  ON product_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas suas próprias avaliações
CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar apenas suas próprias avaliações
CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. FUNCTION PARA ATUALIZAR updated_at AUTOMATICAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_addresses
CREATE TRIGGER update_user_addresses_updated_at
  BEFORE UPDATE ON user_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para product_reviews
CREATE TRIGGER update_product_reviews_updated_at
  BEFORE UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. VIEW PARA ESTATÍSTICAS DE PRODUTOS
-- =====================================================
-- View que agrega informações de avaliações por produto

CREATE OR REPLACE VIEW product_stats AS
SELECT
  p.id AS product_id,
  p.name AS product_name,
  COUNT(DISTINCT f.id) AS favorites_count,
  COUNT(DISTINCT pr.id) AS reviews_count,
  COALESCE(AVG(pr.rating), 0) AS average_rating,
  COUNT(DISTINCT CASE WHEN pr.rating = 5 THEN pr.id END) AS five_star_count,
  COUNT(DISTINCT CASE WHEN pr.rating = 4 THEN pr.id END) AS four_star_count,
  COUNT(DISTINCT CASE WHEN pr.rating = 3 THEN pr.id END) AS three_star_count,
  COUNT(DISTINCT CASE WHEN pr.rating = 2 THEN pr.id END) AS two_star_count,
  COUNT(DISTINCT CASE WHEN pr.rating = 1 THEN pr.id END) AS one_star_count
FROM products p
LEFT JOIN favorites f ON p.id = f.product_id
LEFT JOIN product_reviews pr ON p.id = pr.product_id
GROUP BY p.id, p.name;

-- =====================================================
-- 6. ADICIONAR COLUNAS AO PRODUCTS (SE NÃO EXISTIREM)
-- =====================================================
-- Estas colunas ajudam a exibir estatísticas nos cards de produtos

DO $$
BEGIN
  -- Adicionar coluna de média de avaliações se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE products ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0;
  END IF;

  -- Adicionar coluna de total de avaliações se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'total_reviews'
  ) THEN
    ALTER TABLE products ADD COLUMN total_reviews INTEGER DEFAULT 0;
  END IF;

  -- Adicionar coluna de total de favoritos se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'total_favorites'
  ) THEN
    ALTER TABLE products ADD COLUMN total_favorites INTEGER DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- 7. FUNCTION PARA ATUALIZAR ESTATÍSTICAS DE PRODUTOS
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas do produto
  UPDATE products
  SET
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM product_reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar estatísticas automaticamente
CREATE TRIGGER update_product_stats_on_review_insert
  AFTER INSERT ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stats();

CREATE TRIGGER update_product_stats_on_review_update
  AFTER UPDATE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stats();

CREATE TRIGGER update_product_stats_on_review_delete
  AFTER DELETE ON product_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stats();

-- Trigger para atualizar contagem de favoritos
CREATE OR REPLACE FUNCTION update_product_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET total_favorites = (
    SELECT COUNT(*)
    FROM favorites
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorites_count_on_insert
  AFTER INSERT ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_product_favorites_count();

CREATE TRIGGER update_favorites_count_on_delete
  AFTER DELETE ON favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_product_favorites_count();

-- =====================================================
-- 8. DADOS DE TESTE (OPCIONAL - COMENTADO)
-- =====================================================

-- Descomente as linhas abaixo se quiser inserir dados de teste

/*
-- Exemplo de endereços de teste
INSERT INTO user_addresses (user_id, label, recipient_name, zip_code, street, number, neighborhood, city, state, is_default)
VALUES
  ('user-uuid-aqui', 'Casa', 'João Silva', '76800000', 'Rua Exemplo', '123', 'Centro', 'Porto Velho', 'RO', true),
  ('user-uuid-aqui', 'Trabalho', 'João Silva', '76801000', 'Av. Teste', '456', 'Industrial', 'Porto Velho', 'RO', false);

-- Exemplo de favoritos de teste
INSERT INTO favorites (user_id, product_id)
VALUES
  ('user-uuid-aqui', 'product-uuid-1'),
  ('user-uuid-aqui', 'product-uuid-2');

-- Exemplo de avaliações de teste
INSERT INTO product_reviews (user_id, product_id, order_id, rating, title, comment)
VALUES
  ('user-uuid-aqui', 'product-uuid-1', 'order-uuid-1', 5, 'Excelente produto!', 'Superou minhas expectativas. Muito bom mesmo!'),
  ('user-uuid-aqui', 'product-uuid-2', 'order-uuid-2', 4, 'Bom custo-benefício', 'Produto de qualidade, entrega rápida.');
*/

-- =====================================================
-- FIM DAS MIGRATIONS
-- =====================================================

-- Para executar este arquivo no Supabase:
-- 1. Acesse o Supabase Dashboard
-- 2. Vá em SQL Editor
-- 3. Cole este código
-- 4. Execute (Run)
-- 5. Verifique se todas as tabelas foram criadas em "Table Editor"
