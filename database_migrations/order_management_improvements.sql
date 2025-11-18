-- Adicionar colunas para melhor gerenciamento de pedidos

-- Adicionar coluna de código de rastreio
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_code TEXT;

-- Adicionar coluna de status de pagamento separado
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Comentários para documentação
COMMENT ON COLUMN public.orders.tracking_code IS 'Código de rastreio dos Correios ou transportadora';
COMMENT ON COLUMN public.orders.payment_status IS 'Status do pagamento: pending, approved, rejected, refunded';
COMMENT ON COLUMN public.orders.status IS 'Status do pedido: pending, processing, shipped, delivered, cancelled';
