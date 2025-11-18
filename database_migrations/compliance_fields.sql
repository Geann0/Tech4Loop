# 🗄️ MIGRAÇÃO BANCO DE DADOS - NOVAS COLUNAS

Execute estas queries no **SQL Editor do Supabase** para adicionar os campos necessários:

## 1. Adicionar campos de NF-e na tabela `orders`

```sql
-- Campos para armazenar informações de Nota Fiscal Eletrônica
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS nfe_key TEXT,
ADD COLUMN IF NOT EXISTS nfe_url TEXT,
ADD COLUMN IF NOT EXISTS nfe_error TEXT;

COMMENT ON COLUMN orders.nfe_key IS 'Chave de acesso da NF-e (44 dígitos)';
COMMENT ON COLUMN orders.nfe_url IS 'URL do PDF da DANFE';
COMMENT ON COLUMN orders.nfe_error IS 'Mensagem de erro caso a emissão falhe';
```

## 2. Adicionar campos de rastreamento na tabela `orders`

```sql
-- Campos para rastreamento de envio
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_code TEXT,
ADD COLUMN IF NOT EXISTS label_url TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;

COMMENT ON COLUMN orders.tracking_code IS 'Código de rastreio dos Correios';
COMMENT ON COLUMN orders.label_url IS 'URL do PDF da etiqueta de envio';
COMMENT ON COLUMN orders.shipped_at IS 'Data/hora em que o pedido foi enviado';

-- Criar índice para busca por tracking code
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders(tracking_code);
```

## 3. Adicionar campos de dimensões e peso na tabela `products`

```sql
-- Campos necessários para cálculo de frete e geração de etiquetas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS dimensions JSONB DEFAULT '{"height": 10, "width": 20, "length": 30}'::jsonb,
ADD COLUMN IF NOT EXISTS ncm TEXT DEFAULT '62044200';

COMMENT ON COLUMN products.weight IS 'Peso do produto em kg';
COMMENT ON COLUMN products.dimensions IS 'Dimensões em cm: {height, width, length}';
COMMENT ON COLUMN products.ncm IS 'NCM (Nomenclatura Comum do Mercosul) para NF-e';
```

## 4. Adicionar campos de consentimento LGPD na tabela `profiles`

```sql
-- Campos para registro de consentimento LGPD
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS lgpd_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lgpd_consent_date TIMESTAMPTZ;

COMMENT ON COLUMN profiles.lgpd_consent IS 'Se o usuário aceitou os termos e política';
COMMENT ON COLUMN profiles.lgpd_consent_date IS 'Data/hora do consentimento';

-- Criar índice para compliance reports
CREATE INDEX IF NOT EXISTS idx_profiles_lgpd_consent ON profiles(lgpd_consent, lgpd_consent_date);
```

## 5. Adicionar novos status na tabela `orders`

```sql
-- Verificar se a coluna status existe e alterar tipo se necessário
DO $$ 
BEGIN
    -- Adicionar novos valores ao ENUM (se estiver usando ENUM)
    -- Caso contrário, apenas valide que a coluna aceita TEXT
    
    -- Adicionar check constraint para validar status
    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    
    ALTER TABLE orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN (
        'pending', 
        'processing', 
        'picked',      -- Novo: produtos separados
        'packed',      -- Novo: produtos embalados
        'shipped',     -- Atualizado: enviado aos Correios
        'delivered',   -- Novo: entregue ao cliente
        'cancelled'
    ));
END $$;
```

## 6. Criar tabela de logs de webhook (opcional, para auditoria)

```sql
-- Criar tabela para registrar todos os webhooks recebidos
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    provider TEXT NOT NULL, -- 'mercadopago', 'melhor_envio', etc.
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    signature TEXT,
    is_valid BOOLEAN DEFAULT false,
    processed BOOLEAN DEFAULT false,
    error_message TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_processed ON webhook_logs(processed);

COMMENT ON TABLE webhook_logs IS 'Registro de todos os webhooks recebidos para auditoria';
```

## 7. Atualizar RLS (Row Level Security) se necessário

```sql
-- Permitir que usuários visualizem seus próprios rastreamentos
CREATE POLICY IF NOT EXISTS "Users can view their own order tracking"
ON orders FOR SELECT
USING (
    auth.uid() = user_id
);

-- Permitir que admins atualizem campos de fulfillment
CREATE POLICY IF NOT EXISTS "Admins can update fulfillment fields"
ON orders FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);
```

## 8. Criar função para atualizar timestamp ao enviar

```sql
-- Trigger para preencher shipped_at automaticamente
CREATE OR REPLACE FUNCTION update_shipped_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
        NEW.shipped_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_shipped_at ON orders;

CREATE TRIGGER trigger_update_shipped_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_shipped_at();
```

## ✅ Verificação

Execute esta query para verificar se todas as colunas foram criadas:

```sql
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN (
    'nfe_key', 
    'nfe_url', 
    'nfe_error', 
    'tracking_code', 
    'label_url', 
    'shipped_at'
)
ORDER BY column_name;
```

Resultado esperado: 6 linhas retornadas.

---

## 🔧 Rollback (caso necessário)

Se precisar reverter as mudanças:

```sql
-- Remover colunas
ALTER TABLE orders 
DROP COLUMN IF EXISTS nfe_key,
DROP COLUMN IF EXISTS nfe_url,
DROP COLUMN IF EXISTS nfe_error,
DROP COLUMN IF EXISTS tracking_code,
DROP COLUMN IF EXISTS label_url,
DROP COLUMN IF EXISTS shipped_at;

ALTER TABLE products
DROP COLUMN IF EXISTS weight,
DROP COLUMN IF EXISTS dimensions,
DROP COLUMN IF EXISTS ncm;

ALTER TABLE profiles
DROP COLUMN IF EXISTS lgpd_consent,
DROP COLUMN IF EXISTS lgpd_consent_date;

-- Remover tabela de logs
DROP TABLE IF EXISTS webhook_logs;
```
