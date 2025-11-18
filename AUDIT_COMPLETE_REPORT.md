# 🔍 RELATÓRIO COMPLETO DE AUDITORIA - Tech4Loop

**Data:** 18/11/2025
**Escopo:** Verificação completa de inconsistências em Pagamentos, Pedidos, Endereços, Estoque e Dados

---

## 🚨 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **WEBHOOK MERCADO PAGO** - ⚠️ ALTO RISCO

#### Problema 1.1: Cálculo de Valores na NF-e (CRÍTICO)
**Arquivo:** `src/app/api/webhooks/mercadopago/route.ts` (linha 196-209)

```typescript
// ❌ PROBLEMA: Usa item.products.price ao invés de item.price_at_purchase
produtos: orderDetails.order_items.map((item: any) => ({
  codigo: item.products.id,
  descricao: item.products.name,
  ncm: item.products.ncm || "62044200",
  quantidade: item.quantity,
  valorUnitario: parseFloat(item.products.price),  // ❌ PREÇO ATUAL!
  valorTotal: parseFloat(item.products.price) * item.quantity, // ❌ ERRADO!
})),
```

**Risco:**
- Cliente pagou R$ 100 por produto (preço na época)
- Produto agora custa R$ 150 (preço alterado)
- NF-e será emitida com R$ 150 ❌
- **INFRAÇÃO FISCAL** - valor na nota diferente do valor pago!

**Correção Necessária:**
```typescript
// ✅ CORRETO: Usar price_at_purchase
produtos: orderDetails.order_items.map((item: any) => ({
  codigo: item.product_id,
  descricao: item.products.name,
  ncm: item.products.ncm || "62044200",
  quantidade: item.quantity,
  valorUnitario: item.price_at_purchase,  // ✅ PREÇO PAGO!
  valorTotal: item.price_at_purchase * item.quantity,  // ✅ CORRETO!
})),
```

---

#### Problema 1.2: Validação do Total da NF-e (CRÍTICO)
**Arquivo:** `src/app/api/webhooks/mercadopago/route.ts` (linha 219)

```typescript
// ❌ PROBLEMA: Usa orderDetails.total_amount sem validar
valorTotal: parseFloat(orderDetails.total_amount),
```

**Risco:**
- Se `total_amount` estiver errado no banco (bug anterior)
- NF-e será emitida com valor incorreto
- **INFRAÇÃO FISCAL** - total incorreto

**Correção Necessária:**
```typescript
// ✅ CORRETO: Calcular e validar
const calculatedTotal = orderDetails.order_items.reduce(
  (sum, item) => sum + (item.price_at_purchase * item.quantity),
  0
);

// Alertar se houver divergência
if (Math.abs(calculatedTotal - parseFloat(orderDetails.total_amount)) > 0.01) {
  console.error("⚠️ DIVERGÊNCIA NO TOTAL DA NF-e!");
  console.error("Total calculado:", calculatedTotal);
  console.error("Total no BD:", orderDetails.total_amount);
}

valorTotal: calculatedTotal,  // ✅ USAR VALOR CALCULADO!
```

---

#### Problema 1.3: Email Apenas para Primeiro Parceiro
**Arquivo:** `src/app/api/webhooks/mercadopago/route.ts` (linha 174-183)

```typescript
// ❌ PROBLEMA: Envia email apenas para o PRIMEIRO produto
const firstProduct = orderDetails.order_items[0]?.products;
const partnerEmail = firstProduct?.profiles?.email;
```

**Risco:**
- Pedido tem produtos de 3 parceiros
- Apenas o primeiro parceiro recebe email
- Outros 2 parceiros não sabem que venderam! ❌

**Correção Necessária:**
```typescript
// ✅ CORRETO: Enviar email para TODOS os parceiros envolvidos
const uniquePartners = new Map();

for (const item of orderDetails.order_items) {
  const partnerId = item.products?.partner_id;
  const partnerEmail = item.products?.profiles?.email;
  
  if (partnerId && partnerEmail && !uniquePartners.has(partnerId)) {
    uniquePartners.set(partnerId, {
      email: partnerEmail,
      items: []
    });
  }
  
  if (partnerId) {
    uniquePartners.get(partnerId).items.push(item);
  }
}

// Enviar email para cada parceiro com SEUS produtos
for (const [partnerId, data] of uniquePartners.entries()) {
  await resend.emails.send({
    from: "Vendas <vendas@tech4loop.com.br>",
    to: [data.email],
    subject: `Novo Pedido Recebido: ${data.items.length} produto(s)`,
    react: NewOrderEmail({ 
      order: {...orderDetails, order_items: data.items} 
    }),
  });
}
```

---

### 2. **ENDEREÇOS DO CLIENTE** - ⚠️ MÉDIO RISCO

#### Problema 2.1: Dados do Pedido Não Usam Endereços Salvos
**Arquivo:** `src/app/checkout/cartActions.ts`

```typescript
// ❌ PROBLEMA: Cliente preenche endereço TODA VEZ
// Mesmo tendo endereços salvos em user_addresses
```

**Risco:**
- Cliente tem endereço salvo com erro
- Precisa corrigir TODA VEZ que compra
- Má experiência de usuário

**Correção Necessária:**
1. Checkout deve oferecer seleção de endereços salvos
2. Opção de "usar endereço salvo" ou "inserir novo"
3. Pré-preencher campos se endereço selecionado

**Implementação:**
```typescript
// Buscar endereços do usuário
const { data: savedAddresses } = await supabase
  .from("user_addresses")
  .select("*")
  .eq("user_id", user.id)
  .eq("is_default", true)
  .single();

// Se tem endereço padrão, pré-preencher formulário
if (savedAddresses) {
  formData = {
    address: savedAddresses.street,
    city: savedAddresses.city,
    state: savedAddresses.state,
    cep: savedAddresses.postal_code,
    // ...
  };
}
```

---

### 3. **ESTOQUE** - ⚠️ ALTO RISCO

#### Problema 3.1: Race Condition no Estoque
**Arquivo:** `src/app/api/webhooks/mercadopago/route.ts` (linha 157-168)

```typescript
// ❌ PROBLEMA: Webhook pode ser chamado múltiplas vezes
// Estoque pode ser decrementado DUAS VEZES!
```

**Cenário de Risco:**
1. Webhook chamado às 10:00:00 → Decrementa estoque de 10 para 9
2. Webhook chamado às 10:00:01 (retry) → Decrementa de 9 para 8
3. **Cliente pagou 1, mas estoque decrementou 2!**

**Proteção Atual:**
```typescript
// ✅ JÁ TEM proteção de idempotência
if (existingOrder?.payment_id) {
  return NextResponse.json({ status: "Already processed" }, { status: 200 });
}
```

**MAS:** A proteção é ANTES do decremento, não DEPOIS!

**Correção Necessária:**
```typescript
// ✅ Adicionar flag de estoque_decrementado
const { data: existingOrder } = await supabaseAdmin
  .from("orders")
  .select("payment_id, stock_decremented")  // ✅ Adicionar este campo
  .eq("id", orderId)
  .single();

if (existingOrder?.payment_id && existingOrder?.stock_decremented) {
  return NextResponse.json({ status: "Already processed" }, { status: 200 });
}

// Decrementar estoque...

// Marcar como decrementado
await supabaseAdmin
  .from("orders")
  .update({ stock_decremented: true })  // ✅ Marcar flag
  .eq("id", orderId);
```

---

#### Problema 3.2: Estoque Não Validado no Checkout
**Arquivo:** `src/app/checkout/cartActions.ts` (linha 69-82)

```typescript
// ✅ JÁ TEM validação de estoque!
if (product.stock < item.quantity) {
  return { error: "Estoque insuficiente" };
}
```

**MAS:** Validação é ANTES de criar pedido. Entre validar e pagar, estoque pode acabar!

**Cenário de Risco:**
1. Cliente A: Valida estoque (10 disponíveis) → OK ✅
2. Cliente B: Valida estoque (10 disponíveis) → OK ✅
3. Cliente A: Paga → Estoque vira 9 ✅
4. Cliente B: Paga → Estoque vira 8 ✅
5. **Vendidos 2, mas só tinha 10 e agora tem 8!**

Não é crítico se houver margem, mas pode causar overselling.

**Correção Opcional:**
```typescript
// Reservar estoque por 15 minutos no checkout
await supabase.rpc('reserve_stock', {
  product_uuid: productId,
  quantity: quantity,
  minutes: 15
});
```

---

### 4. **DADOS DO CLIENTE** - ⚠️ BAIXO RISCO

#### Problema 4.1: CPF/CNPJ Não Validado
**Arquivo:** `src/app/checkout/cartActions.ts`

```typescript
// ❌ PROBLEMA: Não valida CPF antes de enviar para NF-e
const cpf = formData.get("cpf");  // Pode ser inválido!
```

**Risco:**
- NF-e será rejeitada se CPF inválido
- Pedido pago mas sem nota fiscal
- Cliente reclama, processo manual necessário

**Correção Necessária:**
```typescript
// ✅ Validar CPF/CNPJ
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  
  // Lógica de validação de CPF
  // ...
  
  return true;
}

// No checkout
if (!validarCPF(cpf)) {
  return { error: "CPF inválido" };
}
```

---

#### Problema 4.2: Telefone Sem Validação de Formato
**Arquivo:** `src/app/checkout/cartActions.ts`

```typescript
// ❌ PROBLEMA: Aceita qualquer formato de telefone
const phone = formData.get("phone");  // (11) 99999-9999 ou 11999999999?
```

**Risco:**
- Parceiro não consegue ligar para cliente
- Transportadora não consegue contatar
- Pedido atrasado

**Correção Necessária:**
```typescript
// ✅ Normalizar telefone
function normalizarTelefone(phone: string): string {
  // Remove tudo exceto dígitos
  const digits = phone.replace(/\D/g, '');
  
  // Valida tamanho (10 ou 11 dígitos)
  if (digits.length < 10 || digits.length > 11) {
    throw new Error("Telefone inválido");
  }
  
  return digits;
}
```

---

### 5. **MULTI-PARCEIRO** - ⚠️ ALTO RISCO

#### Problema 5.1: Pedido com Partner_ID Único
**Arquivo:** `src/app/checkout/cartActions.ts` (linha 86)

```typescript
// ❌ PROBLEMA: Pedido usa partner_id do PRIMEIRO item
partner_id: cart.items[0].partner_id || null,
```

**Risco:**
- Pedido tem produtos de 3 parceiros
- Order.partner_id = Parceiro A
- Parceiro B e C não aparecem nas queries de parceiro! ❌

**Impacto:**
- Partner B dashboard: "0 pedidos" ❌
- Partner C dashboard: "0 pedidos" ❌
- Partner A dashboard: "3 pedidos" mas só 1 produto é dele ❌

**Correção Necessária:**
```typescript
// ✅ SOLUÇÃO 1: Remover partner_id da tabela orders
// ✅ SOLUÇÃO 2: Fazer queries por order_items.products.partner_id

// Já implementado em partner/orders/page.tsx:
.select("*, order_items!inner(*, products!inner(partner_id))")
.eq("order_items.products.partner_id", user.id)

// ✅ MAS: Campo partner_id em orders causa confusão
// RECOMENDAÇÃO: Fazer migration para remover
```

---

### 6. **WEBHOOK DUPLICADO** - ⚠️ BAIXO RISCO

#### Problema 6.1: Dois Webhooks Configurados
**Arquivos:**
- `src/app/api/webhooks/mercadopago/route.ts` ✅ (COM segurança HMAC)
- `src/app/api/payment-webhook/route.ts` ❌ (SEM segurança HMAC)

**Risco:**
- payment-webhook está ATIVO mas SEM validação HMAC
- Qualquer um pode chamar e processar pedidos! ❌
- Webhook duplicado pode causar processamento em duplicata

**Correção Necessária:**
```typescript
// ✅ DELETAR arquivo payment-webhook/route.ts
// ✅ Usar APENAS webhooks/mercadopago/route.ts
```

---

## ✅ PONTOS POSITIVOS (JÁ IMPLEMENTADOS)

### 1. Validação de Totais no Checkout ✅
```typescript
// Valida total recebido vs calculado
const calculatedTotal = cart.items.reduce(...)
if (Math.abs(calculatedTotal - cart.total) > 0.01) {
  return { error: "Erro de validação" };
}
```

### 2. Validação de Preços ✅
```typescript
// Valida preços vs banco de dados
if (Math.abs(product.price - item.product_price) > 0.01) {
  return { error: "Preço foi alterado" };
}
```

### 3. Validação de Estoque ✅
```typescript
if (product.stock < item.quantity) {
  return { error: "Estoque insuficiente" };
}
```

### 4. Idempotência no Webhook ✅
```typescript
if (existingOrder?.payment_id) {
  return NextResponse.json({ status: "Already processed" });
}
```

### 5. Rate Limiting no Webhook ✅
```typescript
const rateLimit = checkRateLimit(identifier, {
  maxRequests: 50,
  windowMs: 60 * 1000,
});
```

### 6. Validação HMAC-SHA256 ✅
```typescript
const calculatedSignature = crypto
  .createHmac("sha256", secret)
  .update(manifest)
  .digest("hex");
```

---

## 🔧 PRIORIDADE DE CORREÇÕES

### 🔴 CRÍTICO (Fazer IMEDIATAMENTE)

1. **NF-e com preços errados** ❌ INFRAÇÃO FISCAL
   - Arquivo: `webhooks/mercadopago/route.ts` linha 196-209
   - Tempo: 10 minutos
   - Impacto: LEGAL/FISCAL

2. **Email apenas para primeiro parceiro** ❌ Parceiros não recebem pedidos
   - Arquivo: `webhooks/mercadopago/route.ts` linha 174-183
   - Tempo: 30 minutos
   - Impacto: NEGÓCIO

3. **Deletar webhook inseguro** ❌ Vulnerabilidade de segurança
   - Arquivo: `api/payment-webhook/route.ts`
   - Tempo: 1 minuto
   - Impacto: SEGURANÇA

### 🟡 IMPORTANTE (Fazer esta semana)

4. **Validação de total na NF-e**
   - Arquivo: `webhooks/mercadopago/route.ts` linha 219
   - Tempo: 15 minutos
   - Impacto: FISCAL

5. **Flag de estoque decrementado**
   - Arquivo: `webhooks/mercadopago/route.ts` + migration
   - Tempo: 30 minutos
   - Impacto: ESTOQUE

6. **Seleção de endereços salvos no checkout**
   - Arquivo: `checkout/CheckoutCartForm.tsx`
   - Tempo: 2 horas
   - Impacto: UX

### 🟢 MELHORIAS (Fazer quando possível)

7. **Validação de CPF/CNPJ**
   - Tempo: 1 hora
   - Impacto: NF-e

8. **Normalização de telefone**
   - Tempo: 30 minutos
   - Impacto: CONTATO

9. **Reserva de estoque temporária**
   - Tempo: 3 horas
   - Impacto: OVERSELLING

---

## 📝 MIGRATIONS NECESSÁRIAS

### Migration 1: Adicionar flag stock_decremented

```sql
-- Adicionar campo para evitar decremento duplicado
ALTER TABLE orders 
ADD COLUMN stock_decremented BOOLEAN DEFAULT FALSE;

-- Criar índice para performance
CREATE INDEX idx_orders_stock_decremented 
ON orders(stock_decremented) 
WHERE stock_decremented = FALSE;
```

### Migration 2: Remover partner_id de orders (opcional)

```sql
-- Remove campo confuso (pedidos multi-parceiro)
ALTER TABLE orders 
DROP COLUMN partner_id;

-- Nota: Queries já usam order_items.products.partner_id
```

---

## 🧪 TESTES NECESSÁRIOS

### Teste 1: NF-e com Preço Correto
```
1. Criar produto por R$ 100
2. Cliente adiciona ao carrinho
3. Alterar preço do produto para R$ 150
4. Cliente finaliza compra
5. Verificar NF-e:
   ✅ Deve ter R$ 100 (preço pago)
   ❌ NÃO R$ 150 (preço atual)
```

### Teste 2: Multi-Parceiro Email
```
1. Criar pedido com 3 produtos de 3 parceiros
2. Pagar com Mercado Pago
3. Verificar:
   ✅ Parceiro A recebe email com SEU produto
   ✅ Parceiro B recebe email com SEU produto
   ✅ Parceiro C recebe email com SEU produto
```

### Teste 3: Webhook Duplicado
```
1. Criar pedido
2. Chamar webhook 2 vezes rapidamente
3. Verificar:
   ✅ Estoque decrementa apenas 1 vez
   ✅ payment_id já existe na segunda chamada
   ✅ Segunda chamada retorna "Already processed"
```

---

## 📊 RESUMO EXECUTIVO

| Categoria | Crítico | Importante | Melhoria | Total |
|-----------|---------|------------|----------|-------|
| **Pagamento/NF-e** | 2 | 1 | 0 | 3 |
| **Estoque** | 0 | 1 | 1 | 2 |
| **Multi-Parceiro** | 1 | 0 | 0 | 1 |
| **Dados Cliente** | 0 | 1 | 2 | 3 |
| **Segurança** | 1 | 0 | 0 | 1 |
| **TOTAL** | **4** | **3** | **3** | **10** |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Crítico (Hoje)
- [ ] Corrigir preços na NF-e (usar price_at_purchase)
- [ ] Implementar email para todos os parceiros
- [ ] Deletar payment-webhook inseguro
- [ ] Validar total da NF-e

### Fase 2: Importante (Esta Semana)
- [ ] Adicionar flag stock_decremented
- [ ] Implementar seleção de endereços salvos
- [ ] Testar todos os cenários críticos

### Fase 3: Melhorias (Próximo Sprint)
- [ ] Validação de CPF/CNPJ
- [ ] Normalização de telefone
- [ ] Sistema de reserva de estoque

---

**Status Geral:**
- 🔴 **Riscos Críticos:** 4 (precisam correção imediata)
- 🟡 **Riscos Importantes:** 3 (corrigir esta semana)
- 🟢 **Melhorias:** 3 (implementar quando possível)

**Tempo Estimado de Correções Críticas:** 1 hora
**Tempo Estimado Total:** 8-10 horas

---

**Próximos Passos:**
1. Revisar este relatório com o time
2. Priorizar correções críticas
3. Implementar correções em ordem de prioridade
4. Testar cada correção
5. Deploy em produção
6. Monitorar logs por 48 horas

