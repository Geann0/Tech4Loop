# 🚀 GUIA DE CONFIGURAÇÃO - COMPLIANCE BRASILEIRO

Este guia detalha como configurar todos os serviços externos necessários para 100% de conformidade com requisitos legais e operacionais de e-commerce no Brasil.

---

## 📋 ÍNDICE

1. [Mercado Pago - Webhook HMAC](#1-mercado-pago---webhook-hmac)
2. [NF-e - Nota Fiscal Eletrônica](#2-nf-e---nota-fiscal-eletrônica)
3. [Melhor Envio - Etiquetas](#3-melhor-envio---etiquetas)
4. [Correios - Rastreamento](#4-correios---rastreamento)
5. [Banco de Dados - Migrações](#5-banco-de-dados---migrações)
6. [Testes e Validação](#6-testes-e-validação)

---

## 1. MERCADO PAGO - WEBHOOK HMAC

### 🔒 Por que é crítico?

Sem validação HMAC, qualquer pessoa pode enviar webhooks falsos para o seu sistema, marcando pedidos como pagos sem realmente pagar.

### Configuração

#### Passo 1: Obter o Webhook Secret

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel)
2. Vá em **Suas integrações** → Sua aplicação
3. Clique em **Webhooks** no menu lateral
4. Copie o **Signing Secret** (ou **Secret** / **Webhook Secret**)

#### Passo 2: Adicionar ao .env

```bash
MERCADO_PAGO_WEBHOOK_SECRET=abc123def456... # Cole o secret aqui
```

#### Passo 3: Configurar URL do Webhook

No painel do Mercado Pago:

- **URL:** `https://seudominio.com/api/webhooks/mercadopago`
- **Eventos:** Selecione `Payments`

#### Passo 4: Testar

Use o Postman ou webhook simulator do MP para enviar um teste:

```bash
curl -X POST https://seudominio.com/api/webhooks/mercadopago \
  -H "X-Signature: ts=1234567890,v1=abc123..." \
  -H "X-Request-Id: abc123" \
  -d '{"type":"payment","data":{"id":"123456789"}}'
```

**Resultado esperado:** Webhook aceito apenas se a assinatura for válida.

---

## 2. NF-e - NOTA FISCAL ELETRÔNICA

### 🧾 Por que é obrigatório?

É **ilegal** enviar produtos sem emitir NF-e no Brasil (Lei Complementar 87/1996). Pode resultar em multas e apreensão de mercadorias.

### Opções de Provedores

#### Opção A: NFe.io (Recomendado)

**Vantagens:** API simples, suporte rápido, planos acessíveis

1. Crie conta em [nfe.io](https://nfe.io)
2. Vá em **API** → **Tokens**
3. Copie seu **API Key** e **Company ID**
4. Adicione ao .env:

```bash
NFE_PROVIDER=nfe.io
NFE_IO_API_KEY=seu-api-key
NFE_IO_COMPANY_ID=seu-company-id
```

#### Opção B: Bling

1. Crie conta em [bling.com.br](https://bling.com.br)
2. Vá em **Configurações** → **API**
3. Gere uma **Chave de Acesso**
4. Adicione ao .env:

```bash
NFE_PROVIDER=bling
BLING_API_KEY=sua-chave-bling
```

#### Opção C: Tiny ERP

1. Crie conta em [tiny.com.br](https://tiny.com.br)
2. Vá em **Configurações** → **API**
3. Copie seu **Token**
4. Adicione ao .env:

```bash
NFE_PROVIDER=tiny
TINY_API_TOKEN=seu-token-tiny
```

### Configuração de Certificado Digital

Para emitir NF-e, você precisa de um **Certificado Digital A1**:

1. Compre em [Certisign](https://certisign.com.br) ou [Serasa](https://serasa.certificadodigital.com.br)
2. Faça upload no painel do provedor (NFe.io, Bling, etc.)

### Teste

Emita uma NF-e de teste após configurar:

```bash
# No console do Supabase, marque um pedido como "processing"
UPDATE orders SET status = 'processing', payment_status = 'approved' WHERE id = 'seu-pedido-id';
```

Aguarde o webhook do Mercado Pago processar e emitir a NF-e automaticamente.

---

## 3. MELHOR ENVIO - ETIQUETAS

### 📦 Por que usar?

Automatiza geração de etiquetas e economiza até 60% no frete comparado a preços de balcão dos Correios.

### Configuração

#### Passo 1: Criar conta

1. Acesse [melhorenvio.com.br](https://melhorenvio.com.br)
2. Crie uma conta empresarial
3. Adicione saldo (via PIX ou boleto)

#### Passo 2: Gerar Token de API

1. Vá em **Configurações** → **API**
2. Clique em **Gerar Token de Produção**
3. Copie o token

#### Passo 3: Adicionar ao .env

```bash
MELHOR_ENVIO_TOKEN=seu-token-aqui
```

#### Passo 4: Configurar dados da empresa

```bash
COMPANY_NAME=Tech4Loop
COMPANY_PHONE=5569993500039
COMPANY_ADDRESS=Rua Exemplo
COMPANY_NUMBER=123
COMPANY_NEIGHBORHOOD=Centro
COMPANY_CITY=Porto Velho
COMPANY_STATE=RO
COMPANY_CEP=76800000
```

### Fluxo de Uso

1. Pedido aprovado → Status "processing"
2. Vendedor separa produtos → Status "picked"
3. Vendedor embala → Status "packed"
4. Sistema gera etiqueta via Melhor Envio automaticamente
5. Vendedor imprime etiqueta e leva aos Correios
6. Status → "shipped" + `tracking_code` salvo no banco

---

## 4. CORREIOS - RASTREAMENTO

### Configuração (Opcional)

Para rastreamento automático via API oficial dos Correios:

1. Cadastre-se no [SIGEP Web](https://www2.correios.com.br/sistemas/sigepweb/)
2. Obtenha suas credenciais
3. Adicione ao .env:

```bash
CORREIOS_USER=seu-usuario-correios
CORREIOS_PASSWORD=sua-senha-correios
```

**Alternativa:** O rastreamento público funciona via Google:

```
https://www.google.com/search?q=CODIGO_RASTREIO+rastreio
```

---

## 5. BANCO DE DADOS - MIGRAÇÕES

### Execute as migrações SQL

1. Abra o **SQL Editor** no Supabase
2. Execute o arquivo `database_migrations/compliance_fields.sql`
3. Verifique se todas as colunas foram criadas:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('nfe_key', 'nfe_url', 'tracking_code', 'label_url');
```

---

## 6. TESTES E VALIDAÇÃO

### Checklist de Testes

#### ✅ Webhook HMAC

- [ ] Webhook com assinatura válida é aceito
- [ ] Webhook sem assinatura é rejeitado (401)
- [ ] Webhook com assinatura inválida é rejeitado (401)

#### ✅ NF-e

- [ ] NF-e é emitida após pagamento aprovado
- [ ] Chave NF-e é salva no banco (`nfe_key`)
- [ ] Cliente recebe email com DANFE (PDF)
- [ ] Em caso de erro, mensagem é registrada (`nfe_error`)

#### ✅ Login Obrigatório

- [ ] Usuário anônimo vê modal ao clicar "Adicionar ao Carrinho"
- [ ] Usuário anônimo vê modal ao clicar "Comprar Agora"
- [ ] Após login, ação é executada automaticamente
- [ ] Usuário logado não vê modal

#### ✅ Reconciliação Financeira

- [ ] Dashboard em `/admin/reconciliation` carrega
- [ ] Valores batem entre `orders.total_amount` e Mercado Pago
- [ ] Exportação CSV funciona

#### ✅ WMS (Fulfillment)

- [ ] Pedidos aparecem em `/admin/fulfillment`
- [ ] Lista de separação pode ser impressa
- [ ] Status pode ser atualizado (processing → picked → packed → shipped)
- [ ] Etiqueta é gerada ao clicar "Gerar Etiqueta"

#### ✅ Rastreamento

- [ ] Página `/rastreamento/[orderId]` carrega
- [ ] Código de rastreio é exibido
- [ ] Timeline de status funciona
- [ ] Link para Correios funciona

#### ✅ LGPD

- [ ] Checkbox de consentimento aparece no registro
- [ ] Não é possível criar conta sem aceitar
- [ ] Data de consentimento é salva no banco

---

## 🎯 RESUMO EXECUTIVO

### Variáveis de Ambiente Obrigatórias

```bash
# Críticas (sem elas, sistema não funciona 100%)
MERCADO_PAGO_WEBHOOK_SECRET=xxx      # Segurança
NFE_PROVIDER=nfe.io                  # Legal
NFE_IO_API_KEY=xxx                   # Legal
NFE_IO_COMPANY_ID=xxx                # Legal

# Recomendadas (melhoram operação)
MELHOR_ENVIO_TOKEN=xxx               # Eficiência
COMPANY_NAME=Tech4Loop               # Etiquetas
COMPANY_CEP=76800000                 # Etiquetas
```

### Tempo Estimado de Configuração

- Mercado Pago HMAC: 10 minutos
- NF-e: 1-2 horas (inclui certificado digital)
- Melhor Envio: 30 minutos
- Migrações SQL: 5 minutos
- Testes: 1 hora

**Total:** Aproximadamente 3-4 horas para configuração completa.

---

## 🆘 SUPORTE

### Problemas Comuns

#### "Webhook rejeitado: assinatura inválida"

- Verifique se `MERCADO_PAGO_WEBHOOK_SECRET` está correto
- Confirme que a URL do webhook no painel MP está correta
- Use `console.log` para debugar o manifest calculado

#### "Erro ao emitir NF-e: certificado inválido"

- Certificado A1 expirou? Renove
- Certificado foi feito upload no provedor?
- CPF/CNPJ do cliente está correto?

#### "Etiqueta não gerada: saldo insuficiente"

- Adicione saldo no Melhor Envio
- Verifique se o token de API está correto
- Confirme que o CEP de origem está cadastrado

---

## 📚 DOCUMENTAÇÃO OFICIAL

- [Mercado Pago Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [NFe.io Docs](https://nfe.io/docs)
- [Melhor Envio API](https://docs.melhorenvio.com.br)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database)
