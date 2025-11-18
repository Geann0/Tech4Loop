# 🧪 Guia Completo de Testes - Tech4Loop

## ✅ Pré-requisitos

Antes de começar os testes, certifique-se de que:

1. **Banco de dados configurado** - Execute a migration:

```sql
-- No SQL Editor do Supabase, execute:
-- c:\Users\User\Desktop\Tech4Loop\database_migrations\order_management_improvements.sql
```

2. **Variáveis de ambiente configuradas** (`.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
MERCADO_PAGO_ACCESS_TOKEN=seu_token
NEXT_PUBLIC_SITE_URL=http://localhost:3002
ADMIN_EMAIL=seu_email@example.com
RESEND_API_KEY=sua_chave_resend
```

3. **Servidor rodando**:

```powershell
npm run dev
```

---

## 📋 Roteiro de Testes

### 1️⃣ Teste de Geolocalização e Cobertura

#### Cenário 1: Produto com cobertura por CIDADE

1. **Acesse:** `http://localhost:3002/admin/login`
2. **Login:** admin@tech4loop.com / senha_admin
3. **Vá para:** Admin → Parceiros → Adicionar Novo
4. **Preencha:**
   - Nome: "Loja Teste RO"
   - Email: parceiro@teste.com
   - Senha: teste123
   - **Cobertura:** Selecione "🏙️ Cidades Específicas"
   - **Cidades:** Digite: "Ouro Preto do Oeste, Ji-Paraná"
5. **Clique:** Criar Parceiro

#### Teste A: CEP dentro da área

1. **Acesse:** Qualquer produto
2. **Clique:** Comprar Agora
3. **Preencha o CEP:** 76920-000 (Ouro Preto do Oeste)
4. **Resultado esperado:** ✅ Checkout prossegue normalmente

#### Teste B: CEP fora da área

1. **Acesse:** Mesmo produto
2. **Clique:** Comprar Agora
3. **Preencha o CEP:** 01310-100 (São Paulo)
4. **Resultado esperado:**
   - ❌ Mensagem: "A loja X não atende sua região (São Paulo/SP)"
   - 🔍 Botão: "Buscar Produtos Similares"
5. **Clique no botão**
6. **Resultado esperado:** Redirecionado para `/produtos?similar=ID&city=São Paulo&state=SP`
7. **Verifica:** Página mostra apenas produtos de lojas que atendem SP

---

#### Cenário 2: Produto com cobertura por ESTADO

1. **Crie outro parceiro:**
   - Nome: "Loja Teste SP"
   - **Cobertura:** Selecione "🗺️ Estados Específicos"
   - **Estados:** Digite: "SP, RJ, MG"
2. **Crie produto** para este parceiro
3. **Teste CEP:** 01310-100 (São Paulo)
4. **Resultado esperado:** ✅ Checkout funciona

---

#### Cenário 3: Produto com cobertura NACIONAL

1. **Crie outro parceiro:**
   - Nome: "Loja Nacional"
   - **Cobertura:** Selecione "🌎 País Inteiro (Brasil)"
2. **Teste com qualquer CEP válido**
3. **Resultado esperado:** ✅ Sempre funciona

---

### 2️⃣ Teste de Pagamento (Mercado Pago)

#### Setup do Mercado Pago

1. **Acesse:** https://www.mercadopago.com.br/developers
2. **Vá para:** Suas aplicações → Credenciais
3. **Copie:** Access Token de TESTE
4. **Cole no** `.env.local`:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx
```

5. **Reinicie o servidor:** `npm run dev`

#### Teste de Checkout

1. **Acesse:** Produto com estoque disponível
2. **Clique:** Comprar Agora
3. **Preencha:**
   - Nome: João Silva
   - Email: joao@teste.com
   - Telefone: 69999999999
   - CEP: 76920-000
   - Endereço: Rua Teste, 123
   - Cidade: Ouro Preto do Oeste
   - Estado: RO
4. **Clique:** Finalizar Compra
5. **Resultado esperado:**
   - ✅ Console do servidor mostra:
     ```
     📍 Validando cobertura para CEP: 76920-000
     ✅ CEP válido e dentro da área de cobertura
     ✅ Order created: uuid-do-pedido
     ✅ Order item created for product: uuid-do-produto
     💳 Creating Mercado Pago preference...
     ✅ Mercado Pago preference created: xxx-xxx
     ```
   - ✅ Redirecionado para página de pagamento do Mercado Pago

#### Teste de Pagamento no Sandbox

1. **Na página do Mercado Pago:**
   - Use cartão de teste: 5031 4332 1540 6351
   - Vencimento: 11/25
   - CVV: 123
   - Nome: APRO (para aprovação automática)
2. **Confirme o pagamento**
3. **Resultado esperado:**
   - ✅ Redirecionado para `/compra-sucesso`
   - ✅ Webhook processa o pagamento
   - ✅ Status do pedido muda para "processing"
   - ✅ Estoque é decrementado

---

### 3️⃣ Teste de Gerenciamento de Pedidos

#### Como Admin

1. **Acesse:** `http://localhost:3002/admin/orders`
2. **Verifique:** Lista de todos os pedidos
3. **Para um pedido "pending":**
   - **Clique:** ✅ Aprovar
   - **Resultado:** Status muda para "processing"
   - **OU Clique:** ❌ Cancelar
   - **Resultado:** Status muda para "cancelled"

4. **Para um pedido "processing":**
   - **Clique:** 📦 Enviar
   - **Digite:** Código de rastreio (ex: BR123456789BR)
   - **Clique:** Confirmar Envio
   - **Resultado:** Status muda para "shipped"

5. **Para um pedido "shipped":**
   - **Clique:** ✓ Marcar como Entregue
   - **Resultado:** Status muda para "delivered"

#### Como Parceiro

1. **Logout do admin**
2. **Login como parceiro:** parceiro@teste.com / teste123
3. **Acesse:** Painel do Parceiro → Pedidos
4. **Verifique:** Aparecem APENAS pedidos de produtos deste parceiro
5. **Teste as mesmas ações:** Aprovar → Enviar → Entregar
6. **Tente acessar pedido de outro parceiro:**
   - **Resultado esperado:** ❌ Erro "Este pedido não pertence a você"

---

### 4️⃣ Teste de Webhook do Mercado Pago

#### Configurar Webhook (Produção)

1. **No painel do Mercado Pago:**
   - Vá para: Suas aplicações → Webhooks
   - URL: `https://seu-dominio.com/api/webhooks/mercadopago`
   - Eventos: Pagamentos

#### Testar Localmente (com ngrok)

1. **Instale ngrok:** https://ngrok.com/
2. **Execute:**

```powershell
ngrok http 3002
```

3. **Copie a URL:** `https://xxxx.ngrok.io`
4. **Atualize `.env.local`:**

```env
NEXT_PUBLIC_SITE_URL=https://xxxx.ngrok.io
```

5. **Configure webhook no Mercado Pago** com esta URL
6. **Faça um pagamento de teste**
7. **Monitore o console:**

```
Webhook recebido!
Pagamento aprovado: xxx
Atualizando pedido: xxx
Decrementando estoque...
Enviando email...
```

---

### 5️⃣ Teste de Estoque

1. **Crie produto com estoque:** 5 unidades
2. **Faça 3 compras aprovadas**
3. **Verifique:** Estoque agora = 2
4. **Tente comprar com estoque = 0:**
   - **Resultado esperado:** ❌ "Produto fora de estoque"

---

## 🐛 Problemas Comuns

### Erro: "Could not find column"

**Solução:** Execute a migration de melhorias de pedidos

### Erro: "NEXT_PUBLIC_SITE_URL não está definida"

**Solução:** Adicione no `.env.local` e reinicie o servidor

### Erro: "Mercado Pago auto_return invalid"

**Solução:** Certifique-se de que `NEXT_PUBLIC_SITE_URL` está sem barra no final

### Geolocalização não funciona

**Solução:**

1. Teste manualmente: https://viacep.com.br/ws/76920000/json/
2. Verifique console do navegador (F12)
3. Verifique logs do servidor

---

## ✅ Checklist Final

- [ ] Admin pode criar parceiros com diferentes tipos de cobertura
- [ ] Checkout valida CEP antes do pagamento
- [ ] Produtos similares são sugeridos quando fora da área
- [ ] Filtro de produtos por região funciona
- [ ] Pagamento com Mercado Pago funciona
- [ ] Webhook processa pagamentos corretamente
- [ ] Admin pode gerenciar todos os pedidos
- [ ] Parceiro pode gerenciar apenas seus pedidos
- [ ] Estoque é decrementado após pagamento aprovado
- [ ] Código de rastreio pode ser adicionado
- [ ] Status do pedido evolui corretamente: pending → processing → shipped → delivered

---

## 📊 Status Esperados

| Status       | Descrição                            | Quando usar                             |
| ------------ | ------------------------------------ | --------------------------------------- |
| `pending`    | Aguardando aprovação do pagamento    | Criado automaticamente                  |
| `processing` | Pagamento aprovado, preparando envio | Após webhook/aprovação manual           |
| `shipped`    | Enviado para o cliente               | Ao adicionar rastreio                   |
| `delivered`  | Entregue ao cliente                  | Confirmação final                       |
| `cancelled`  | Cancelado                            | Pagamento falhou ou cancelamento manual |

---

## 🎯 Fluxo Completo Ideal

```
1. Cliente acessa produto
2. Clica "Comprar Agora"
3. Sistema valida CEP → Dentro da área ✅
4. Cliente preenche dados
5. Clica "Finalizar Compra"
6. Sistema cria Order + Order Item
7. Redireciona para Mercado Pago
8. Cliente paga com cartão de teste
9. Mercado Pago envia webhook
10. Sistema processa:
    - Atualiza status → "processing"
    - Decrementa estoque
    - Envia email para parceiro
11. Parceiro acessa painel
12. Clica "📦 Enviar" → Digite rastreio
13. Status → "shipped"
14. Cliente recebe produto
15. Parceiro clica "✓ Entregue"
16. Status → "delivered" ✅
```

Siga este guia passo a passo e reporte qualquer erro encontrado!
