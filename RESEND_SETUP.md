# Configuração do Resend para Emails

## Configuração do Domínio

### 1. Criar Conta no Resend

1. Acesse https://resend.com
2. Crie uma conta ou faça login
3. Vá para "Domains" no painel

### 2. Adicionar Domínio

1. Clique em "Add Domain"
2. Digite seu domínio: `tech4loop.com.br`
3. O Resend irá fornecer registros DNS

### 3. Configurar DNS

Adicione os seguintes registros no seu provedor de DNS:

```
Tipo: TXT
Nome: _resend
Valor: [fornecido pelo Resend]

Tipo: MX
Nome: @
Valor: [fornecido pelo Resend]
Prioridade: 10

Tipo: TXT
Nome: @
Valor: v=spf1 include:resend.com ~all
```

### 4. Verificar Domínio

1. Aguarde propagação DNS (pode levar até 48h, geralmente 1-2h)
2. Clique em "Verify Domain" no painel Resend
3. Aguarde confirmação

### 5. Obter API Key

1. Vá para "API Keys" no painel
2. Clique em "Create API Key"
3. Dê um nome (ex: "Tech4Loop Production")
4. Copie a chave gerada

### 6. Configurar no Projeto

Adicione no arquivo `.env.local`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
```

### 7. Atualizar Emails no Código

Os seguintes arquivos precisam ser atualizados com o domínio verificado:

#### `src/app/api/webhooks/mercadopago/route.ts`

```typescript
from: "Vendas <vendas@tech4loop.com.br>";
```

#### `src/app/api/contact/route.ts`

```typescript
from: "Contato <contato@tech4loop.com.br>";
```

#### Outros emails (se houver)

- `Suporte <suporte@tech4loop.com.br>`
- `Noreply <noreply@tech4loop.com.br>`

## Endereços de Email Recomendados

| Email                      | Uso                                    |
| -------------------------- | -------------------------------------- |
| `vendas@tech4loop.com.br`  | Notificações de vendas para parceiros  |
| `contato@tech4loop.com.br` | Formulário de contato do site          |
| `suporte@tech4loop.com.br` | Suporte ao cliente                     |
| `noreply@tech4loop.com.br` | Emails automáticos (confirmações, etc) |
| `admin@tech4loop.com.br`   | Notificações administrativas           |

## Criar Caixas de Email

### Gmail/Google Workspace (Recomendado)

1. Configure Google Workspace para `tech4loop.com.br`
2. Crie as contas de email necessárias
3. Configure redirecionamentos se necessário

### Alternativa: Forward para Gmail Pessoal

No painel do seu provedor de domínio:

1. Configure forwards:
   - `vendas@tech4loop.com.br` → seu-email@gmail.com
   - `contato@tech4loop.com.br` → seu-email@gmail.com
   - etc.

## Testar Configuração

### 1. Teste Simples via Código

Crie um arquivo `test-email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend("re_your_api_key");

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: "Vendas <vendas@tech4loop.com.br>",
      to: ["seu-email@gmail.com"],
      subject: "Teste de Email - Tech4Loop",
      html: "<p>Se você recebeu isso, o Resend está funcionando! 🎉</p>",
    });

    if (error) {
      console.error("Erro:", error);
    } else {
      console.log("Email enviado:", data);
    }
  } catch (error) {
    console.error("Erro:", error);
  }
}

testEmail();
```

Execute:

```bash
npx tsx test-email.ts
```

### 2. Verificar no Painel Resend

1. Vá para "Logs" no painel Resend
2. Verifique se o email aparece como "Delivered"

## Monitoramento

### Métricas Importantes

- **Delivery Rate**: Deve estar acima de 95%
- **Bounce Rate**: Deve estar abaixo de 5%
- **Spam Complaints**: Deve estar próximo de 0%

### Alertas

Configure alertas no Resend para:

- Bounces altos
- Spam complaints
- Erros de API

## Limites e Custos

### Plano Free

- 3,000 emails/mês
- 100 emails/dia
- Ideal para: Desenvolvimento e testes

### Plano Paid (Recomendado para Produção)

- A partir de $20/mês
- 50,000 emails/mês inclusos
- $0.0008 por email adicional
- Sem limite diário

## Boas Práticas

1. **Use Reply-To**: Configure reply-to para emails que não devem receber respostas

```typescript
from: "Noreply <noreply@tech4loop.com.br>",
reply_to: "contato@tech4loop.com.br"
```

2. **Segmente por Tipo**: Use diferentes "from" para diferentes tipos de email
   - Vendas: identificação clara para parceiros
   - Contato: para respostas de clientes
   - Noreply: confirmações automáticas

3. **Templates**: Use componentes React para emails consistentes
   - Já implementado: `NewOrderEmail.tsx`
   - Criar: `ContactConfirmationEmail.tsx`, etc.

4. **Logs**: Sempre faça log de emails enviados

```typescript
console.log("Email sent:", { to, subject, status });
```

## Troubleshooting

### Email não está sendo enviado

- ✅ Verificar se API key está correta
- ✅ Verificar se domínio está verificado
- ✅ Checar logs no painel Resend
- ✅ Verificar se RESEND_API_KEY está no .env.local

### Email vai para spam

- ✅ Configurar SPF record corretamente
- ✅ Adicionar DKIM (Resend configura automaticamente)
- ✅ Usar domínio verificado (não `onboarding@resend.dev`)
- ✅ Evitar palavras spam no assunto/corpo

### Erro "Domain not found"

- ✅ Esperar propagação DNS (até 48h)
- ✅ Verificar se registros DNS estão corretos
- ✅ Usar `dig` ou `nslookup` para verificar

```bash
nslookup -type=TXT _resend.tech4loop.com.br
nslookup -type=MX tech4loop.com.br
```

## Checklist de Produção

- [ ] Domínio verificado no Resend
- [ ] API Key configurada em produção
- [ ] Todos os `from:` atualizados com domínio real
- [ ] Caixas de email criadas
- [ ] Teste de envio realizado
- [ ] Monitoramento configurado
- [ ] Plano pago ativado (se necessário)
- [ ] Alertas configurados
- [ ] Documentação de emails criada para a equipe

## Recursos

- [Documentação Resend](https://resend.com/docs)
- [Guia de DNS](https://resend.com/docs/knowledge-base/dns-records)
- [React Email](https://react.email) - Templates de email
- [Painel Resend](https://resend.com/emails)
